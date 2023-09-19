import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

const html = htm.bind(h);

export function SelectConstraints({
  allAvailableConstraints,
  selectedConstraints,
  toggleSelectedConstraints,
}) {
  return html`
    ${allAvailableConstraints.map(
      (constraint) => html`<div>
        <input
          type="checkbox"
          checked=${selectedConstraints.find(({ id }) => constraint.id === id)}
          onChange=${() => toggleSelectedConstraints(constraint)}
        />
        <span>${constraint.code.Name}</span>
      </div>`
    )}
  `;
}
