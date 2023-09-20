import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useEffect } from "https://esm.sh/preact/hooks";

import { generateGeometry } from "../util/render.js";

export function useVisualize(runResult, isHovering) {
  useEffect(async () => {
    if (runResult.type === "success") {
      const failedVisualizations = runResult.data?.info?.outputs?.find(
        ({ name }) => name === "FailedVisualization"
      );

      if (failedVisualizations?.value) {
        const color = isHovering ? [0, 255, 0, 255] : [255, 0, 0, 200];
        await Forma.render.updateMesh({
          id: failedVisualizations.Id,
          geometryData: await generateGeometry(failedVisualizations, color),
        });
      } else {
        if (failedVisualizations?.Id) {
          await Forma.render.removeMesh({ id: failedVisualizations.Id });
        }
      }
    } else {
      await Forma.render.cleanup();
    }

    return async () => {};
  }, [runResult, isHovering]);
}
