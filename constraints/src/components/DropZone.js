import { h } from "https://esm.sh/preact";
import { useCallback } from "https://esm.sh/preact/hooks";
import htm from "https://esm.sh/htm";
import { Drop } from "../icons/Drop.js";

const html = htm.bind(h);

export function DropZone({ onReceiveDrop }) {
  const ondrop = useCallback(
    async (ev) => {
      ev.preventDefault();
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        const files = await Promise.all(
          [...ev.dataTransfer.items].map(async (item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
              const file = item.getAsFile();

              const reader = new FileReader();

              const contentP = new Promise((resolve) =>
                reader.addEventListener(
                  "load",
                  () => {
                    // this will then display a text file
                    resolve(reader.result);
                  },
                  false
                )
              );

              reader.readAsText(file);

              return { name: file.name, code: JSON.parse(await contentP) };
            }
          })
        );

        onReceiveDrop(files);
      }
    },
    [onReceiveDrop]
  );

  const ondragover = useCallback((e) => {
    e.preventDefault();
  });

  return html`<div
    style=${{
      width: "226px",
      height: "84px",
      borderRadius: "2px",
      border: "1px solid #3C3C3C10",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      marigin: "10px 0",
    }}
    ondrop=${ondrop}
    ondragover=${ondragover}
  >
    <${Drop} />
    <div style=${{ margin: "0 30px", textAlign: "center" }}>
      Drag and drop a dynamo constraint script here
    </div>
  </div>`;
}
