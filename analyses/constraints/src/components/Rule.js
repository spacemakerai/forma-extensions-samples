import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect } from "https://esm.sh/preact/hooks";
import { useAutomaticInputs } from "../hooks/useAutomaticInputs.js";
import * as Dynamo from "../dynamo/dynamo.js";
import { generateGeometry } from "../util/render.js";

// Initialize htm with Preact
const html = htm.bind(h);

const automaticInputs = [
  "Proposals",
  "SiteLimits",
  "Surroundings",
  "Constraints",
  "Terrain",
];

function RuleInput({ input, state, setState }) {
  if (input.Type === "string") {
    if (automaticInputs.includes(input.Name)) {
      return html`<div>${input.Name} - automatic</div>`;
    } else {
      return html`<input
        type="text"
        defaultValue=${state[input.Id]}
        onChange=${(ev) =>
          setState((state) => ({ ...state, [input.Id]: ev.target.value }))}
      />`;
    }
  } else if (input.Type === "number") {
    return html`<div>
      ${input.Name}<input
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

function RuleInputs({ rule, state, setState }) {
  return rule.Inputs.map(
    (input) =>
      html`<${RuleInput} input=${input} state=${state} setState=${setState} />`
  );
}

function useRunRule(rule, state) {
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

      if (failedVisualizations.value) {
        await Forma.render.updateMesh({
          id: failedVisualizations.Id,
          geometryData: await generateGeometry(failedVisualizations),
        });
      }
    }
  }, [runResult]);
}

export function Rule({ rule, removeRule }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({});

  const defaultValues = useDefaultValues(rule);
  const automatic = useAutomaticInputs(rule);

  useEffect(() => {
    setState((state) => ({ ...state, ...defaultValues, ...automatic }));
  }, [automatic]);

  const runResult = useRunRule(rule, state);

  useVisualize(runResult);

  return html` <div style=${{ border: "1px solid gray" }}>
    ${rule.Name} ${runResult.type === "running" && html`<div>⏳</div>`}
    ${runResult.type === "success" &&
    html`<div>
      ${runResult.data?.info?.outputs?.find(({ name }) => name === "Result")
        ?.value
        ? "✅"
        : "❌"}
    </div>`}
    <button onClick=${removeRule}>X</button>
    <button onClick=${() => setExpanded((expanded) => !expanded)}>\\/</button>

    ${expanded &&
    html`<${RuleInputs} rule=${rule} state=${state} setState=${setState} />`}
  </div>`;
}
