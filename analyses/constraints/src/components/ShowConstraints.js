import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect } from "https://esm.sh/preact/hooks";
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

function ScriptInput({ input, state, setState }) {
  if (input.Type === "string") {
    if (automaticInputs.includes(input.Name)) {
      return html`<div><span>${input.Name} - automatic</span></div>`;
    } else {
      return html`<div>
        <span>${input.Name}</span>
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
      <span>${input.Name}</span>
      <input
        type="number"
        defaultValue=${state[input.Id]}
        onChange=${(ev) =>
          setState((state) => ({
            ...state,
            [input.Id]: parseInt(ev.target.value, 10),
          }))}
      />
    </div>`;
  } else {
    return html`<div>${input.Name} - not supported</div>`;
  }
}

function ScriptInputs({ rule, state, setState }) {
  return rule.Inputs.map(
    (input) =>
      html`<${ScriptInput}
        input=${input}
        state=${state}
        setState=${setState}
      />`
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

function useVisualize(runResult) {
  useEffect(async () => {
    if (runResult.type === "success") {
      const failedVisualizations = runResult.data.info.outputs.find(
        ({ name }) => name === "FailedVisualization"
      );

      if (failedVisualizations?.value) {
        await Forma.render.updateMesh({
          id: failedVisualizations.Id,
          geometryData: await generateGeometry(failedVisualizations),
        });
      }
    }
  }, [runResult]);
}

export function Constraint({ code }) {
  const [state, setState] = useState({});

  const defaultValues = useDefaultValues(code);
  const automatic = useAutomaticInputs(code);

  useEffect(() => {
    setState((state) => ({ ...state, ...defaultValues, ...automatic }));
  }, [automatic]);

  const runResult = useRunScript(code, state);

  useVisualize(runResult);

  return html` <div style=${{ border: "1px solid gray" }}>
    <span>${code.Name}</span> ${runResult.type === "running" &&
    html`<div>⏳</div>`}
    ${runResult.type === "success" &&
    html`<div>
      ${runResult.data?.info?.outputs?.find(({ name }) => name === "Result")
        ?.value
        ? "✅"
        : "❌"}
    </div>`}
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
