import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect, useCallback } from "https://esm.sh/preact/hooks";
import { useAutomaticInputs } from "../hooks/useAutomaticInputs.js";
import { Trash } from "../icons/Trash.js";
import { Plus } from "../icons/Plus.js";
import { Minus } from "../icons/Minus.js";
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

const buildInRules = ["Drawing tool", "Facade Minimum Distance"];

function AutomaticInput({ input, state }) {
  const onMouseEnter = useCallback(async () => {
    const positions = new Float32Array(JSON.parse(state).flat());

    const l = positions.length / 3;

    const color = new Uint32Array(Array(l).fill([255, 255, 0, 255]).flat());

    await Forma.render.updateMesh({
      id: input.Id,
      geometryData: {
        position: new Float32Array(JSON.parse(state).flat()),
        color: color,
      },
    });
  }, [input.Id, state]);

  const onMouseLeave = useCallback(async () => {
    await Forma.render.remove({ id: input.Id });
  }, [input.Id, input]);

  return html`<div onMouseEnter=${onMouseEnter} onMouseLeave=${onMouseLeave}>
    automatic
  </div>`;
}

function InputField({ input, state, setState }) {
  if (input.Type === "string") {
    if (automaticInputs.includes(input.Name)) {
      return html`<${AutomaticInput}
        input=${input}
        state=${state[input.Id]}
      />`;
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
  return rule.Inputs.filter(
    (input) => !automaticInputs.includes(input.Name)
  ).map(
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

function AddConstraint({ constraint, toggleSelectedConstraints }) {
  return html` <div>
    <div
      style=${{
        display: "flex",
        flexDirection: "row",
        color: "lightgray",
        justifyContent: "space-between",
      }}
    >
      <h2 style=${{ marginTop: "13px", marginBottom: "13px" }}>
        ${constraint.code.Name}
      </h2>
      <div style=${{ margin: "13px 0", display: "flex", flexDirection: "row" }}>
        <div style=${{ cursor: "pointer", marginRight: "5px" }}>
          <${Plus} onClick=${() => toggleSelectedConstraints(constraint.id)} />
        </div>
      </div>
    </div>
  </div>`;
}

function ActiveConstraint({
  constraint,
  toggleSelectedConstraints,
  removeConstraint,
}) {
  const code = constraint.code;
  const [state, setState] = useState({});

  const [isHovering, setIsHovering] = useState(false);
  const defaultValues = useDefaultValues(code);
  const [automatic, isInitialized] = useAutomaticInputs(code);

  useEffect(() => {
    setState((state) => ({ ...state, ...defaultValues, ...automatic }));
  }, [automatic]);

  const runResult = useRunScript(code, state, isInitialized);

  useVisualize(constraint.id, runResult, isHovering);

  const isBuiltIn = buildInRules.includes(code.Name);

  return html` <div>
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
        <${EmojiStatus} runResult=${runResult} />
        <div style=${{ cursor: "pointer", marginRight: "5px" }}>
          ${isBuiltIn
            ? html`<${Minus}
                onClick=${() => toggleSelectedConstraints(constraint.id)}
              />`
            : html`<${Trash}
                onClick=${() => {
                  toggleSelectedConstraints(constraint.id);
                  removeConstraint(constraint.id);
                }}
              />`}
        </div>
      </div>
    </div>
    <${ScriptInputs} rule=${code} state=${state} setState=${setState} />
  </div>`;
}

function Constraint({
  constraint,
  isActive,
  toggleSelectedConstraints,
  removeConstraint,
}) {
  if (isActive) {
    return html`<${ActiveConstraint}
      constraint=${constraint}
      toggleSelectedConstraints=${toggleSelectedConstraints}
      removeConstraint=${removeConstraint}
    />`;
  } else {
    return html`<${AddConstraint}
      constraint=${constraint}
      toggleSelectedConstraints=${toggleSelectedConstraints}
    />`;
  }
}

export function ConstraintList({
  selectedConstraints,
  allAvailableConstraints,
  toggleSelectedConstraints,
  removeConstraint,
}) {
  return html`<div>
    ${allAvailableConstraints.map(
      (constraint) =>
        html`<${Constraint}
          constraint=${constraint}
          isActive=${selectedConstraints.includes(constraint.id)}
          toggleSelectedConstraints=${toggleSelectedConstraints}
          removeConstraint=${removeConstraint}
        />`
    )}
  </div>`;
}
