import { h } from "https://esm.sh/preact";
import { useCallback } from "https://esm.sh/preact/hooks";
import htm from "https://esm.sh/htm";
import { DropZone } from "./DropZone.js";

const html = htm.bind(h);

function makeId() {
  return (
    Math.random().toString(36).substring(2, 9) +
    Math.random().toString(36).substring(2, 9) +
    Math.random().toString(36).substring(2, 9) +
    Math.random().toString(36).substring(2, 9)
  );
}

export function ManageConstraints({
  allAvailableConstraints,
  addConstraint,
  selectedConstraints,
  toggleSelectedConstraints,
}) {
  const downloadTempalate = useCallback(async () => {
    const template = await fetch("src/built-in-constraints/template.json").then(
      (r) => r.text()
    );
    const save_link = document.createElement("a");
    save_link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
      template
    )}`;
    save_link.download = "DynamoConstraintTemplate.dyn";
    const event = new MouseEvent("click", {
      bubbles: false,
      cancelable: false,
    });
    save_link.dispatchEvent(event);
  }, []);

  return html`
    <a
      onclick=${downloadTempalate}
      style=${{ cursor: "pointer", color: "var(--text-active)" }}
    >
      Download template</a
    >
    <br />
    <a
      target="_blank"
      href="docs/write-your-own-dynamo-script"
      style=${{ cursor: "pointer", color: "var(--text-active)" }}
    >
      Learn how to build</a
    >
    <${DropZone}
      onReceiveDrop=${(file) => {
        file.forEach(({ code }) => {
          addConstraint({
            id: makeId(),
            Uuid: code.Uuid,
            code,
          });
        });
      }}
    />
    ${allAvailableConstraints.map(
      (constraint) => html` <div
        style=${{ marginTop: "10px", marginBottom: "10px" }}
      >
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
