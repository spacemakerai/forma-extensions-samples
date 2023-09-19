import { h, render } from "https://esm.sh/preact";
import { useState } from "https://esm.sh/preact/hooks";
import htm from "https://esm.sh/htm";
import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useSelectedConstraints } from "./hooks/useSelectedConstraints.js";
import { useAllConstraints } from "./hooks/useAllConstraints.js";
import { SelectConstraints } from "./components/SelectConstraints.js";
import { ShowConstraints } from "./components/ShowConstraints.js";
import { Cheveron } from "./icons/Cheveron.js";

window.Forma = Forma;

// Initialize htm with Preact
const html = htm.bind(h);

function Constraints() {
  const [selectedConstraints, toggleSelectedConstraints] =
    useSelectedConstraints();
  const allAvailableConstraints = useAllConstraints();
  const [showAddConstraint, setShowAddConstraint] = useState(false);

  if (!allAvailableConstraints.length) {
    return html`<div>Loading...</div>`;
  }

  return html`
    <div>
      <div
        style=${{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <h1 style=${{ fontWeight: "700" }}>Constraints</h1>

        <${Cheveron}
          open=${showAddConstraint}
          style=${{ margin: "5px" }}
          onClick=${() => setShowAddConstraint(!showAddConstraint)}
        />
      </div>
      ${showAddConstraint &&
      html`<${SelectConstraints}
        allAvailableConstraints=${allAvailableConstraints}
        selectedConstraints=${selectedConstraints}
        toggleSelectedConstraints=${toggleSelectedConstraints}
      />`}

      <${ShowConstraints} constraints=${selectedConstraints} />
    </div>
  `;
}

render(html`<${Constraints} />`, document.body);
