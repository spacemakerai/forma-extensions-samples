import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { useEffect } from "https://esm.sh/preact/hooks";

import { generateGeometry } from "../util/render.js";

const ids = {};

export function useVisualize(constaintId, runResult, isHovering) {
  if (!ids[constaintId]) {
    ids[constaintId] = new Set();
  }

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
        ids[constaintId].add(failedVisualizations.Id);
      } else {
        if (failedVisualizations?.Id) {
          await Forma.render.removeMesh({ id: failedVisualizations.Id });
        }
      }
    } else {
      for (let id of ids[constaintId]) {
        await Forma.render.removeMesh({ id });
      }
    }

    return async () => {};
  }, [runResult, isHovering]);
}
