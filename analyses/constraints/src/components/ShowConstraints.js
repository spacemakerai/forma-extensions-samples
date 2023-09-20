import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect, useRef } from "https://esm.sh/preact/hooks";
import { useAutomaticInputs } from "../hooks/useAutomaticInputs.js";
import { Trash } from "../icons/Trash.js";
import { useRunScript } from "../hooks/useRunScript.js";
import { useVisualize } from "../hooks/useVisualize.js";

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

function useDefaultValues(rule) {
  return Object.fromEntries(rule.Inputs.map(({ Id, Value }) => [Id, Value]));
}

function EmojiStatus({ runResult }) {
  if (runResult.type === "running") {
    return html`<div>⏳</div>`;
  } else if (runResult.type === "error") {
    return html`<div title=${runResult.error}>💥</div>`;
  } else if (runResult.type === "success") {
    return html`<div>
      ${runResult.data?.info?.outputs?.find(({ name }) => name === "Result")
        ?.value
        ? "✅"
        : "❌"}
    </div>`;
  }
}

export function Constraint({ constraint, toggleSelectedConstraints }) {
  const code = constraint.code;
  const [state, setState] = useState({});
  const topDiv = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const defaultValues = useDefaultValues(code);
  const [automatic, isInitialized] = useAutomaticInputs(code);

  useEffect(() => {
    setState((state) => ({ ...state, ...defaultValues, ...automatic }));
  }, [automatic]);

  const runResult = useRunScript(code, state, isInitialized);

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
      <div style=${{ margin: "13px 0", display: "flex", flexDirection: "row" }}>
        ${isHovering &&
        html`<div style=${{ cursor: "pointer", marginRight: "5px" }}>
          <${Trash} onClick=${() => toggleSelectedConstraints(constraint.id)} />
        </div>`}
        <${EmojiStatus} runResult=${runResult} />
      </div>
    </div>
    <${ScriptInputs} rule=${code} state=${state} setState=${setState} />
  </div>`;
}

export function ShowConstraints({
  selectedConstraints,
  allAvailableConstraints,
  toggleSelectedConstraints,
}) {
  return html`<div>
    ${selectedConstraints.map(
      (constraintId) =>
        html`<${Constraint}
          constraint=${allAvailableConstraints.find(
            ({ id }) => constraintId === id
          )}
          toggleSelectedConstraints=${toggleSelectedConstraints}
        />`
    )}
  </div>`;
}
