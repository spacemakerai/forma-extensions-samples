import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect, useRef } from "https://esm.sh/preact/hooks";
import { useAutomaticInputs } from "../hooks/useAutomaticInputs.js";
import * as Dynamo from "../dynamo/dynamo.js";
import { generateGeometry } from "../util/render.js";

// Initialize htm with Preact
const html = htm.bind(h);

const automaticInputs = [
  "Proposal",
  "SiteLimits",
  "Surroundings",
  "Constraints",
  "Terrain",
];

function InputField({ input, state, setState }) {
  if (input.Type === "string") {
    if (automaticInputs.includes(input.Name)) {
      return "automatic";
    } else {
      return html`<div>
        <input
          type="text"
          defaultValue=${state[input.Id]}
          onChange=${(ev) =>
            setState((state) => ({ ...state, [input.Id]: ev.target.value }))}
        />
      </div>`;
    }
  } else if (input.Type === "number") {
    return html`<div>
      <input
        type="number"
        style=${{ width: "70px" }}
        defaultValue=${state[input.Id]}
        onChange=${(ev) =>
          setState((state) => ({
            ...state,
            [input.Id]: parseInt(ev.target.value, 10),
          }))}
      />
    </div>`;
  } else {
    return "not supported";
  }
}

function ScriptInputs({ rule, state, setState }) {
  return rule.Inputs.map(
    (input) =>
      html`<div
        style=${{
          marginTop: "13px",
          marginBottom: "13px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <span>${input.Name}</span>
        <${InputField} input=${input} state=${state} setState=${setState} />
      </div>`
  );
}

function useRunScript(rule, state) {
  const [result, setResult] = useState({ type: "init" });
  useEffect(async () => {
    setResult({ type: "running" });
    try {
      setResult({ type: "success", data: await Dynamo.run(rule, state) });
    } catch (e) {
      setResult({ type: "error", error: e });
    }
  }, [JSON.stringify(state)]);

  return result;
}

function useDefaultValues(rule) {
  return Object.fromEntries(rule.Inputs.map(({ Id, Value }) => [Id, Value]));
}

function useVisualize(runResult, isHovering) {
  useEffect(async () => {
    if (runResult.type === "success") {
      const failedVisualizations = runResult.data?.info?.outputs?.find(
        ({ name }) => name === "FailedVisualization"
      );

      if (failedVisualizations?.value) {
        const color = isHovering ? [0, 255, 0, 255] : [255, 0, 0, 200];
        await Forma.render.updateMesh({
          id: failedVisualizations.Id,
          geometryData: await generateGeometry(failedVisualizations, color),
        });
      }
    }
  }, [runResult, isHovering]);
}

function EmojiStatus({ runResult }) {
  if (runResult.type === "running") {
    return html`<div style=${{ marginTop: "13px", marginBottom: "13px" }}>
      ⏳
    </div>`;
  } else if (runResult.type === "error") {
    return html`<div style=${{ marginTop: "13px", marginBottom: "13px" }}>
      💥
    </div>`;
  } else if (runResult.type === "success") {
    return html`<div style=${{ marginTop: "13px", marginBottom: "13px" }}>
      ${runResult.data?.info?.outputs?.find(({ name }) => name === "Result")
        ?.value
        ? "✅"
        : "❌"}
    </div>`;
  }
}

export function Constraint({ code }) {
  const [state, setState] = useState({});
  const topDiv = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const defaultValues = useDefaultValues(code);
  const automatic = useAutomaticInputs(code);

  useEffect(() => {
    setState((state) => ({ ...state, ...defaultValues, ...automatic }));
  }, [automatic]);

  const runResult = useRunScript(code, state);

  useVisualize(runResult, isHovering);

  return html` <div ref=${topDiv}>
    <div
      onMouseEnter=${() => setIsHovering(true)}
      onMouseLeave=${() => setIsHovering(false)}
      style=${{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",

        backgroundColor: isHovering ? "#eee" : "#fff",
      }}
    >
      <h2
        onMouseEnter=${() => setIsHovering(true)}
        onMouseLeave=${() => setIsHovering(false)}
        style=${{ marginTop: "13px", marginBottom: "13px" }}
      >
        ${code.Name}
      </h2>
      <${EmojiStatus} runResult=${runResult} />
    </div>
    <${ScriptInputs} rule=${code} state=${state} setState=${setState} />
  </div>`;
}

export function ShowConstraints({ constraints }) {
  return html`<div>
    ${constraints.map(
      (constraint) => html`<${Constraint} code=${constraint.code} />`
    )}
  </div>`;
}
