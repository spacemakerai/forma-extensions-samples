import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
const html = htm.bind(h);

export function FacadeMimumumDistance() {
  return html`<>
      Facade minimum distance
      <input
        type="number"
        defaultValue="${config.facadeDistance}"
        onchange=${(e) => {
          const updated = {
            ...config,
            facadeDistance: parseInt(e.target.value, 10),
          };
          setConfig(updated);
        }}
      />
    </>`;
}
