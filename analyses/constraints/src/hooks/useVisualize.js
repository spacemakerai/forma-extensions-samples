import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useEffect, useState } from "https://esm.sh/preact/hooks";

import { generateGeometry } from "../util/render.js";

const colorRGB = [247, 214, 214]
const hoverOpacity = 0.8
const defaultOpacity = 0.5

export function useVisualize(constaintId, runResult, isHovering) {
  const [inScene, setInScene] = useState([]);
  useEffect(async () => {
    if (runResult.type === "success") {
      const failedVisualizations = runResult.data?.info?.outputs?.find(
        ({ name }) => name === "FailedVisualization"
      );

      if (failedVisualizations?.value) {
        const color =[...colorRGB, 255 * (isHovering ? hoverOpacity : defaultOpacity)]
        await Forma.render.updateMesh({
          id: constaintId,
          geometryData: await generateGeometry(failedVisualizations, color),
        });
        setInScene((inScene) => [...inScene, constaintId]);
      } else {
        if (inScene.includes(constaintId)) {
          setInScene((inScene) => inScene.filter((id) => id !== constaintId));
          await Forma.render.remove({ id: constaintId });
        }
      }
    } else {
      if (inScene.includes(constaintId)) {
        setInScene((inScene) => inScene.filter((id) => id !== constaintId));
        await Forma.render.remove({ id: constaintId });
      }
    }

    return async () => {};
  }, [runResult, isHovering]);
}
