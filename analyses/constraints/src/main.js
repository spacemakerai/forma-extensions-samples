import { h, render } from "https://esm.sh/preact";
import { useState, useEffect } from "https://esm.sh/preact/compat";
import htm from "https://esm.sh/htm";
import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useCalculateConflicts } from "./hooks/useCalculateConflicts.js";
import { generateGeometry } from "./util/render.js";
import { FacadeMimumumDistance } from "./components/FacadeMinimumDistance.js";
import { FacadeBuffer } from "./components/FacadeBuffer.js";

// Initialize htm with Preact
const html = htm.bind(h);

function Constraints() {
  const [config, setConfig] = useState({});

  const conflicts = useCalculateConflicts(config);

  useEffect(async () => {
    if (conflicts.type === "success") {
      console.log(await generateGeometry(conflicts.data));
      await Forma.render.updateMesh({
        id: "constraint-conflicts",
        geometryData: await generateGeometry(conflicts.data),
      });
    }

    return async () =>
      await Forma.render.removeMesh({ id: "constraint-conflicts" });
  }, [conflicts]);

  return html`
    <div>
      <h1>Constraints</h1>
      <div>
        <${FacadeMimumumDistance} config=${config} setConfig=${setConfig} />
        <${FacadeBuffer} config=${config} setConfig=${setConfig} />
      </div>
    </div>
  `;
}

render(html`<${Constraints} />`, document.body);
