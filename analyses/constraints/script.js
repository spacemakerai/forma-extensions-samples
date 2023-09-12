import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { body } from "./RequestUpdate.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { h, render } from "https://esm.sh/preact";
import { useState, useCallback, useEffect } from "https://esm.sh/preact/compat";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
const html = htm.bind(h);
const loader = new GLTFLoader();

const colors = {
  Contraint: [0, 255, 0, 200],
  Conflict: [255, 0, 0, 200],
};

function RenderGeometry({ output, active, setActive }) {
  const onEnter = useCallback(async () => {
    try {
      console.log("enter", output.name);
      await Forma.render.updateMesh({
        id: output.id,
        geometryData: await generateGeometry(output),
      });
    } catch (e) {
      console.error(e);
    }
  });

  useEffect(async () => {
    try {
      const geometryData = await generateGeometry(output);
      if (active === output.name) {
        await Forma.render.updateMesh({
          id: output.id,
          geometryData,
        });
      }
      if (active !== output.name) {
        await Forma.render.remove({
          id: output.id,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [active]);

  const onExit = useCallback(async () => {
    try {
      if (active !== output.name) {
        await Forma.render.remove({
          id: output.id,
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  return html`
    <button
      class=${active === output.name ? "selected-" + output.name : ""}
      onmouseenter=${onEnter}
      onmouseleave=${onExit}
      onclick=${() => setActive(output.name)}
    >
      ${output.name}
    </button>
  `;
}

function RenderGeometries({ output, active, setActive }) {
  const geometry = (output?.info?.outputs || [])
    .filter(({ valueSchema }) => valueSchema.format === "GLTF_MODEL")
    .filter(({ value }) => !!value);

  return html`
    Output:
    <br />
    <div>
      ${geometry.length === 0 && "No outputs with value"}
      ${geometry.map(
        (output) =>
          html` <${RenderGeometry}
              output=${output}
              active=${active}
              setActive=${setActive}
            />
            <br />`
      )}
    </div>
  `;
}

let initialConfig = {};
try {
  initialConfig = JSON.parse(
    localStorage.getItem(`dynamo-config-${Forma.getProjectId()}}`) || "{}"
  );
} catch (e) {
  console.warn("Errornous cache value for dynamo-config ignored");
}

function DynamoRunner({ url }) {
  const [active, setActive] = useState("Conflict");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(initialConfig);

  useEffect(async () => {
    let rootUrn = await Forma.proposal.getRootUrn();
    const id = setInterval(async () => {
      const urn = await Forma.proposal.getRootUrn();
      if (urn !== rootUrn) {
        setIsLoading(true);
        setOutput(null);
        setOutput(await callDynamo(url));
        setIsLoading(false);
        rootUrn = urn;
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(async () => {
    setIsLoading(true);
    setOutput(await callDynamo(url, config));
    setIsLoading(false);
  }, []);

  const downloadRequest = useCallback(async () => {
    const body = await bakeBody(config);

    const save_link = document.createElement("a");
    save_link.href = `data:application/json;${JSON.stringify(body)}`;
    save_link.download = (await Forma.proposal.getId()) + ".json";
    const event = new MouseEvent("click", {
      bubbles: false,
      cancelable: false,
    });
    save_link.dispatchEvent(event);
  }, [config]);

  return html`
    <div>${isLoading && "loading"}</div>

    <button onclick=${downloadRequest}>Download request</button><br />

    Facade minimum distance
    <input
      type="number"
      defaultValue="${config.facadeDistance}"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeDistance: parseInt(e.target.value, 10),
        };

        setConfig(updated);

        localStorage.setItem(
          `dynamo-config-${Forma.getProjectId()}}`,
          JSON.stringify(updated)
        );
      }}
    />
    <br />

    Facade buffer
    <input
      type="number"
      defaultValue="${config.facadeBuffer}"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeBuffer: parseInt(e.target.value, 10),
        };

        setConfig(updated);

        localStorage.setItem(
          `dynamo-config-${Forma.getProjectId()}}`,
          JSON.stringify(updated)
        );
      }}
    />
    <br />

    <${RenderGeometries}
      output=${output}
      active=${active}
      setActive=${setActive}
    />
  `;
}

function App(props) {
  const [url, setUrl] = useState(localStorage.getItem("dynamo-url") || null);

  const onChange = useCallback((e) => {
    const { value } = e.target;
    localStorage.setItem("dynamo-url", value);
    setUrl(value);
  });

  return html`
    <div>
      <h1>Constraints</h1>

      <input defaultValue=${url} onchange=${onChange} />

      ${!url && "Set dynamo url to start"}
      ${url && html`<${DynamoRunner} url=${url} />`}
    </div>
  `;
}

render(html`<${App} />`, document.body);

function filterPositions(array) {
  const res = new Float32Array(array.length / 2);
  let idx = 0;

  for (let i = 0; i < array.length; i += 6) {
    res[idx + 0] = array[i + 0];
    res[idx + 1] = -array[i + 2];
    res[idx + 2] = array[i + 1];
    idx += 3;
  }
  return res;
}

async function bakeBody(config) {
  const rootUrn = await Forma.proposal.getRootUrn();

  const proposal = (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "generic",
        })),
      ]
        .filter((path) => path.split("/").length === 2)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));

  const surroundings = (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })
      )
        .filter((path) => path.split("/").length === 3)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));

  const constraints = (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "constraints",
        })
      ).map((path) =>
        Forma.geometry.getTriangles({
          urn: rootUrn,
          path,
        })
      )
    )
  ).map((a) => Array.from(a));

  return {
    ...body,
    inputs: [
      {
        nodeId: "ac0733e3121e4fb4a90ce1990060c4bd",
        value: JSON.stringify(constraints),
      },
      {
        nodeId: "f3e2d30403324d74bac56b6d0e7b7473",
        value: JSON.stringify(proposal),
      },
      /*{
        nodeId: "57d3a29891014ef89bac997b62da4123",
        value: JSON.stringify(config || {}),
      },
      {
        nodeId: "57d3a29891014ef89bac997b62da4124",
        value: JSON.stringify(surroundings),
      },*/
    ],
  };
}

function toNonIndexed(positions, index) {
  const res = new Float32Array(index.length * 3);

  for (let i = 0; i < index.length; i++) {
    const idx = index[i] * 3;
    res[i * 3 + 0] = positions[idx + 0];
    res[i * 3 + 1] = positions[idx + 1];
    res[i * 3 + 2] = positions[idx + 2];
  }

  return res;
}

async function generateGeometry(output) {
  const geometry = await new Promise((resolve) => {
    loader.load(
      "data:application/octet-stream;base64," + output.value,
      async (gltf) => {
        resolve(gltf.scenes[0].children[0].geometry);
      }
    );
  });

  if (!geometry.getIndex()) {
    return null;
  }

  const positions = geometry.attributes.position.array;
  const index = [...geometry.getIndex().array];
  const position = filterPositions(positions);
  const nonIndexPositions = toNonIndexed(position, index);
  const color = Array(nonIndexPositions.length / 3)
    .fill(colors[output.name])
    .flat();

  return {
    position: nonIndexPositions,
    index,
    color: new Uint8Array(color),
  };
}

async function callDynamo(url, config) {
  try {
    const body = await bakeBody(config);

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const r = await response.json();

    return r;
  } catch (e) {
    console.error(e);
  }
}
