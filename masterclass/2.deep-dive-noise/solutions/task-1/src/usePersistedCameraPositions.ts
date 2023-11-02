import { Forma } from "forma-embedded-view-sdk/auto";
import { StateUpdater, useCallback, useEffect, useState } from "preact/hooks";

/* Bonus task */

type CameraPosition = {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
};

export function usePersistedCameraPositions(): [
  CameraPosition[],
  StateUpdater<CameraPosition[]>,
] {
  const [cameraPositions, setCameraPositions] = useState([]);

  useEffect(() => {
    Forma.extensions.storage
      .getTextObject({ key: "camera-positions" })
      .then((res) => {
        const positions = JSON.parse(res.data);
        setCameraPositions(positions);
      });
  });

  const setPersistedCameraPositions = useCallback(
    (updater) => async () => {
      const newPositions = updater(cameraPositions);
      await Forma.extensions.storage.setObject({
        key: "camera-positions",
        data: JSON.stringify(newPositions),
      });

      setCameraPositions(newPositions);
    },
    [cameraPositions]
  );

  return [cameraPositions, setPersistedCameraPositions];
}
