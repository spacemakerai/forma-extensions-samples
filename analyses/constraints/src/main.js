import { h, render } from "https://esm.sh/preact";
import { useState } from "https://esm.sh/preact/compat";
import htm from "https://esm.sh/htm";
import { useCalculateConflicts } from "./hooks/useCalculateConflicts";
import { generateGeometry } from "./util/render";

// Initialize htm with Preact
const html = htm.bind(h);

function Constraints() {
  const [config, setConfig] = useState({});

  const conflicts = useCalculateConflicts(config);

  useEffect(async () => {
    if (conflicts.type === "success") {
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
        <${FacadeBuffer} config${config} setConfig=${setConfig} />
      </div>
    </div>
    </div>
  `;
}

render(html`<${Constraints} />`, document.body);
