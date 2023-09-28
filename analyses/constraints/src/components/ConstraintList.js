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

function StatusIndicator({ runResult, hover }) {
  const circleStyle = {
    borderRadius: "5px",
    border: "1px solid",
    width: "6px",
    height: "6px",
    margin: "4px",
  };
  if (!runResult) {
    return html`<div
      style=${{
        ...circleStyle,
        borderColor: hover ? "#808080" : "#9D9D9D",
        backgroundColor: "white",
      }}
    />`;
  }

  if (runResult.type === "running" || runResult.type === "init") {
    return html`<div
      style=${{
        ...circleStyle,
        borderColor: "#0696D7",
        backgroundColor: "#CDEAF7",
        animation: "pulse 1.5s linear infinite",
      }}
    />`;
  } else if (runResult.type === "error") {
    return html`<div title=${runResult.error}>💥</div>`;
  } else if (runResult.type === "success") {
    const color = runResult.data?.info?.outputs?.find(
      ({ name }) => name === "Result"
    )?.value
      ? "#9FC966"
      : "#F48686";
    return html` <div
      style=${{
        ...circleStyle,
        borderColor: color,
        backgroundColor: color,
      }}
    />`;
  }
}

function ContraintRow({
  name,
  constraintId,
  isActive,
  runResult,
  toggleSelectedConstraints,
}) {
  const [isHovered, setIsHovered] = useState(false);
  return html`<div
    onMouseEnter=${() => setIsHovered(true)}
    onMouseLeave=${() => setIsHovered(false)}
    style=${{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: "40px",
      color: isActive || isHovered ? "black" : "#9D9D9D",
      backgroundColor: isHovered && isActive ? "#F2F2F2" : "white",
    }}
  >
    <div
      style=${{
        marginLeft: "3px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <${StatusIndicator} runResult=${runResult} hover=${isHovered} />
      <div style=${{ marginLeft: "8px", fontWeight: "500" }}>${name}</div>
    </div>
    <div
      onClick=${() => toggleSelectedConstraints(constraintId)}
      style=${{
        cursor: "pointer",
        backgroundColor: isHovered ? "#E7E7E7" : "white",
        padding: "6px",
        width: "16px",
        height: "16px",
        marginRight: "5px",
      }}
    >
      ${isActive ? html`<${Minus} />` : html`<${Plus} }} />`}
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
    >
      <${ContraintRow}
        name=${code.Name}
        constraintId=${constraint.id}
        isActive=${true}
        runResult=${runResult}
        toggleSelectedConstraints=${toggleSelectedConstraints}
      />
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
    return html`<${ContraintRow}
      name=${constraint.code.Name}
      constraintId=${constraint.id}
      isActive=${false}
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
