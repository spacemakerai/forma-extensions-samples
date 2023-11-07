import { useState, useCallback, useEffect } from "preact/compat";

import { DynamoOutput } from "./components/DynamoOutput.js";
import { DynamoInput } from "./components/DynamoInput.js";
import { Forma } from "forma-embedded-view-sdk/auto";
import { Back } from "../icons/Back.js";
import dynamoIconUrn from "../icons/dynamo.png";
import { isSelect } from "../utils/node.js";
import { NotTrustedGraph } from "./components/NotTrustedGraph.js";
import { SelectMode } from "./components/SelectMode.tsx";

function getDefaultValues(scriptInfo: any) {
  if (scriptInfo.type === "loaded") {
    const inputs = scriptInfo?.data?.inputs || []; // JSON.parse(code).Inputs;
    const state: any = {};

    for (const input of inputs) {
      if (input.value) {
        if (input.type === "FormaTerrain") {
          //state[input.id] = "selected";
          // Intentionally ignored does not work between sessions
          state[input.id] = undefined;
        } else if (input.type === "boolean") {
          state[input.id] = input.value === "true";
        } else if (isSelect(input)) {
          // state[input.id] = JSON.parse(input.value.replace("\r\n", ""));
          // Intentionally ignored does not work between sessions
          state[input.id] = undefined;
        } else {
          state[input.id] = input.value;
        }
      }
    }
    return state;
  } else {
    return {};
  }
}

type Errors = "GRAPH_NOT_TRUSTED";

type ScriptResult =
  | { type: "init" }
  | { type: "loading" }
  | { type: "error"; data: any }
  | { type: "loaded"; data: any };

function useScript(
  script: any,
  dynamoHandler: any,
): [ScriptResult, () => void] {
  const [state, setState] = useState<ScriptResult>({ type: "init" });

  const reload = useCallback(() => {
    setState({ type: "loading" });

    dynamoHandler("getGraphInfo", { code: script.code })
      .then((data) => {
        setState({ type: "loaded", data });
      })
      .catch((err) => {
        if (err.status === 500 && err.message === "Graph is not trusted.") {
          setState({ type: "error", data: "GRAPH_NOT_TRUSTED" });
        } else {
          setState({ type: "error", data: err.message });
        }
      });
  }, [script]);

  useEffect(() => {
    reload();
  }, [reload]);

  return [state, reload];
}

function AnimatedLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const start = new Date();
    const interval = setInterval(() => {
      if (start.getTime() + 3000 < new Date().getTime()) {
        setSlow(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "100%", marginTop: "5px" }}>
      <weave-skeleton-item
        width="90%"
        style={{ marginBottom: "5px" }}
      ></weave-skeleton-item>
      <weave-skeleton-item
        width="70%"
        style={{ marginBottom: "5px" }}
      ></weave-skeleton-item>
      <weave-skeleton-item
        width="50%"
        style={{ marginBottom: "5px" }}
      ></weave-skeleton-item>
      {slow && (
        <div style={{ marginTop: "5px" }}>
          This is taking longer than usual. Please open Dynamo and check if it
          is blocked with a message dialog.
        </div>
      )}
    </div>
  );
}

type Output =
  | { type: "init" }
  | { type: "running" }
  | { type: "success"; data: any }
  | { type: "error"; data: any };

export function LocalScript({ script, setScript, dynamoHandler }: any) {
  const [scriptInfo, reload] = useScript(script, dynamoHandler);
  const [activeSelectionNode, setActiveSelectionNode] = useState<
    { id: string; name: string } | undefined
  >(undefined);

  const [state, setState] = useState<Record<string, any>>({});

  useEffect(() => {
    if (scriptInfo.type === "loaded") {
      setState(getDefaultValues(scriptInfo));
    }
  }, [scriptInfo]);

  const [output, setOutput] = useState<Output>({ type: "init" });

  const setValue = useCallback(
    (id: string, value: any) =>
      setState((state) => ({ ...state, [id]: value })),
    [],
  );

  const onRun = useCallback(async () => {
    try {
      if (scriptInfo.type !== "loaded") {
        return;
      }
      const code = scriptInfo.data;
      setOutput({ type: "running" });
      const urn = await Forma.proposal.getRootUrn();
      const inputs = await Promise.all(
        Object.entries(state).map(async ([id, value]) => {
          const input = code.inputs.find(
            (input: { id: string }) => input.id === id,
          );

          if (
            input.type === "FormaSelectElements" ||
            input.type === "FormaSelectElement"
          ) {
            const paths = value as string[];
            const triangles = await Promise.all(
              paths.map((path) =>
                Forma.geometry
                  .getTriangles({ path })
                  .then((triangles) =>
                    triangles ? [...triangles] : undefined,
                  ),
              ),
            );
            const footprints = await Promise.all(
              paths.map((path) =>
                Forma.geometry
                  .getFootprint({ path })
                  .then((polygon) =>
                    polygon ? polygon.coordinates : undefined,
                  ),
              ),
            );

            const elements = paths.map((_, index) => ({
              triangles: triangles[index],
              footprints: footprints[index],
            }));

            return { nodeId: id, value: JSON.stringify(elements) };
          } else if (input.type === "FormaTerrain") {
            const [path] = await Forma.geometry.getPathsByCategory({
              category: "terrain",
            });
            return {
              nodeId: id,
              value: JSON.stringify([
                [...(await Forma.geometry.getTriangles({ path }))],
              ]),
            };
          } else if (
            input.name === "Triangles" ||
            input.type === "FormaSelectGeometry"
          ) {
            return {
              nodeId: id,
              value: JSON.stringify(
                await Promise.all(
                  (value as string[]).map(async (path) => {
                    return [
                      ...(await Forma.geometry.getTriangles({ urn, path })),
                    ];
                  }),
                ),
              ),
            };
          } else if (
            input.name === "Footprint" ||
            input.type === "FormaSelectFootprints"
          ) {
            return {
              nodeId: id,
              value: JSON.stringify(
                await Promise.all(
                  (value as string[]).map(async (path) => {
                    return [
                      // @ts-ignore
                      ...(await Forma.geometry.getFootprint({ urn, path }))
                        .coordinates,
                    ];
                  }),
                ),
              ),
            };
          } else if (
            input.name === "Metrics" ||
            input.type === "FormaSelectMetrics"
          ) {
            return {
              nodeId: id,
              value: JSON.stringify(
                await Forma.areaMetrics.calculate({ paths: value as string[] }),
              ),
            };
          } else {
            return {
              nodeId: id,
              value: value,
            };
          }
        }),
      );

      setOutput({
        type: "success",
        data: await dynamoHandler("runGraph", { code, inputs }),
      });
    } catch (e) {
      console.error(e);
      setOutput({ type: "error", data: e });
    }
  }, [scriptInfo, state]);

  useEffect(() => {
    setOutput({ type: "init" });
  }, [state]);

  return (
    <>
      {activeSelectionNode && (
        <SelectMode
          activeSelectionNode={activeSelectionNode}
          setActiveSelectionNode={setActiveSelectionNode}
          setValue={setValue}
        />
      )}
      <div style={{ display: activeSelectionNode ? "none" : "block" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Back onClick={() => setScript(undefined)} />
          {script.name}
        </div>

        {scriptInfo.type === "error" &&
          scriptInfo.data === "GRAPH_NOT_TRUSTED" && (
            <NotTrustedGraph
              script={script}
              reload={reload}
              dynamoHandler={dynamoHandler}
            />
          )}
        {["init", "loading"].includes(scriptInfo.type) && <AnimatedLoading />}

        {scriptInfo.type === "loaded" && (
          <div>
            <div
              style={{
                marginBottom: "5px",
                paddingBottom: "5px",
              }}
            ></div>
            <DynamoInput
              code={scriptInfo.data}
              state={state}
              setValue={setValue}
              activeSelectionNode={activeSelectionNode}
              setActiveSelectionNode={setActiveSelectionNode}
            />
            <weave-button
              style={{ width: "100%", margin: "10px 0" }}
              variant="solid"
              disabled={output.type === "running"}
              onClick={onRun}
            >
              Run
            </weave-button>
            <DynamoOutput output={output} />
          </div>
        )}
      </div>
    </>
  );
}
