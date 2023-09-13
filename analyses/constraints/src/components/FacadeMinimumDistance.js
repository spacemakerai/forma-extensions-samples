import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
const html = htm.bind(h);

export function FacadeMimumumDistance({ config, setConfig }) {
  return html`
    Facade minimum distance
    <input
      defaultValue="${config.facadeDistance}"
      type="number"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeDistance: parseInt(e.target.value, 10),
        };
        setConfig(updated);
      }}
    />
    <br />
  `;
}
