import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useSelectedConstraints } from "./hooks/useSelectedConstraints.js";
import { useAllConstraints } from "./hooks/useAllConstraints.js";
import { ConstraintList } from "./components/ConstraintList.js";
import { AddConstraint } from "./components/AddConstraint.js";

window.Forma = Forma;

// Initialize htm with Preact
const html = htm.bind(h);

function Constraints() {
  const [selectedConstraints, toggleSelectedConstraints] =
    useSelectedConstraints();
  const [allAvailableConstraints, addConstraint, removeConstraint] =
    useAllConstraints();

  if (!allAvailableConstraints.length) {
    return html`<div>Loading...</div>`;
  }

  return html`
    <div>
      <div style=${{ height: "48px", alignItems: "center", display: "flex" }}>
        <h1 style=${{ fontWeight: "600" }}>Constraints</h1>
      </div>

      <${ConstraintList}
        selectedConstraints=${selectedConstraints}
        allAvailableConstraints=${allAvailableConstraints}
        toggleSelectedConstraints=${toggleSelectedConstraints}
        removeConstraint=${removeConstraint}
      />
      <div
        style=${{
          marginTop: "10px",
          marginBottom: "10px",
          height: "1px",
          width: "228px",
          backgroundColor: "#3C3C3C10",
        }}
      />

      <${AddConstraint} addConstraint=${addConstraint} />
    </div>
  `;
}

render(html`<${Constraints} />`, document.body);
