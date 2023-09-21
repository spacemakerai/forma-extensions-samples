import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useEffect, useState } from "https://esm.sh/preact/hooks";

import { generateGeometry } from "../util/render.js";

export function useVisualize(constaintId, runResult, isHovering) {
  const [inScene, setInScene] = useState([]);
  useEffect(async () => {
    if (runResult.type === "success") {
      const failedVisualizations = runResult.data?.info?.outputs?.find(
        ({ name }) => name === "FailedVisualization"
      );

      if (failedVisualizations?.value) {
        const color = isHovering ? [0, 255, 0, 255] : [255, 0, 0, 200];
        console.time("updateMesh");
        await Forma.render.updateMesh({
          id: constaintId,
          geometryData: await generateGeometry(failedVisualizations, color),
        });
        console.timeEnd("updateMesh");
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
