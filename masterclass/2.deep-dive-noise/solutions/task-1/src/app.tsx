import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import { usePersistedCameraPositions } from "./usePersistedCameraPositions";

const transitionTimeMs = 2000;

export function App() {
  // Bonus task: Replace with useState([]) to remove
  const [cameraPositions, setCameraPositions] = useState([]); // usePersistedCameraPositions();

  const reset = useCallback(() => setCameraPositions(() => []), []);

  const addPosition = useCallback(async () => {
    const { position, target } = await Forma.camera.getCurrent();

    setCameraPositions((positions) => [...positions, { position, target }]);
  }, []);

  useEffect(() => {
    console.log(cameraPositions);
  }, [cameraPositions]);

  const play = useCallback(async () => {
    for (let { position, target } of cameraPositions) {
      await Forma.camera.move({ position, target, transitionTimeMs });
    }
  }, [cameraPositions]);

  return (
    <div>
      <h1>Fly by camera</h1>

      <button onClick={addPosition}>Add view</button>
      <button onClick={play}>Play</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
