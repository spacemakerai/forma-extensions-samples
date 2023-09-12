import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
const html = htm.bind(h);

export function FacadeBuffer({ config, setConfig }) {
  return html`<>
     Facade buffer
    <input
      type="number"
      defaultValue="${config.facadeBuffer}"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeBuffer: parseInt(e.target.value, 10),
        };
        setConfig(updated);
      }}
    />
    </>`;
}
