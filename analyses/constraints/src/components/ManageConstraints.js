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
    const template = await fetch("src/built-in-constraints/Template.json").then(
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
          checked=${selectedConstraints.find((id) => constraint.id === id)}
          onChange=${() => toggleSelectedConstraints(constraint.id)}
        />
        <span>${constraint.code.Name}</span>
      </div>`
    )}

    <div
      style=${{
        border: "1px solid #3C3C3C10",
        padding: "10px",
        width: "206px",
      }}
    >
      <img src="src/assets/dynamo-example.png" width="208" height="80" />

      <div style=${{
        margin: "10px 0",
        color: "#3C3C3C",
      }}>You can upload your own Dynamo script and run it as a constraint. Download our template to get
        started or check out our documentation to learn more.
      </div>

      <div style=${{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
      }}>
        <a
          onclick=${downloadTempalate}
          style=${{
            cursor: "pointer",
            color: "var(--text-active)",
            margin: "5px 10px",
          }}
        >
          Download</a
        >
        <button
          onClick=${() => () =>
            window.open("docs/write-your-own-dynamo-script", "_blank")}
          class="weave-passive"
        >
          Learn more</a
        >
    </button>
    </div>
  `;
}
