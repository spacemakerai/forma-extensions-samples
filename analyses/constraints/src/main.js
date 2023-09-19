import { h, render } from "https://esm.sh/preact";
import { useState, useEffect } from "https://esm.sh/preact/compat";
import htm from "https://esm.sh/htm";
import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { Rule } from "./components/Rule.js";
import { useConstraintRules } from "./hooks/useConstraintRules.js";

window.Forma = Forma;

// Initialize htm with Preact
const html = htm.bind(h);

function AddConstraint({ rules, addRule }) {
  const [selectedConstraint, setSelectedConstraint] = useState(rules[0]?.Uuid);

  return html`
    Add rules
    <select onChange=${(e) => setSelectedConstraint(e.target.value)}>
      ${rules.map(
        (rule) => html`<option value=${rule.Uuid}>${rule.Name}</option>`
      )}
    </select>

    <button
      onClick=${() => {
        if (selectedConstraint) {
          const rule = rules.find((rule) => rule.Uuid === selectedConstraint);
          addRule(rule);
        }
      }}
    >
      Add
    </button>
  `;
}

function Constraints() {
  const [constraintRules, addRule, removeRule] = useConstraintRules();
  const [rules, setRules] = useState([]);

  useEffect(async () => {
    const rules = await Promise.all(
      ["ConstraintConflicts", "FacadeMinimumDistance"].map(
        async (rule) =>
          await fetch("src/rules/" + rule + ".json").then((res) => res.json())
      )
    );
    setRules(rules);
  }, []);

  if (!rules.length) {
    return html`<div>Loading...</div>`;
  }

  return html`
    <div>
      <h1>Constraints</h1>
      <div>
        ${constraintRules.map(
          (rule) =>
            html`<${Rule}
              rule=${rules.find(({ Uuid }) => Uuid === rule.ruleId)}
              removeRule=${() => removeRule(rule.id)}
            />`
        )}
      </div>

      <${AddConstraint} rules=${rules} addRule=${addRule} />
    </div>
  `;
}

render(html`<${Constraints} />`, document.body);
