import { Forma } from "forma-embedded-view-sdk/auto";
import { useState } from "preact/hooks";

type CameraPosition = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  target: {
    x: number;
    y: number;
    z: number;
  };
};

export function App() {
  const [cameraPositions, setCameraPositions] = useState<CameraPosition[]>([]);
  const [transitionTime, setTransitionTime] = useState<number>(2000);

  const addCameraPosition = async () => {
    const currentCameraPosition = await Forma.camera.getCurrent();
    setCameraPositions((cameraPositions) => [
      ...cameraPositions,
      {
        position: currentCameraPosition.position,
        target: currentCameraPosition.target,
      },
    ]);
  };

  const flyBetweenCameraPositions = async () => {
    for (const cameraPosition of cameraPositions) {
      await Forma.camera.move({
        ...cameraPosition,
        transitionTimeMs: transitionTime,
      });
    }
  };
  return (
    <div>
      <h3>Fly-through extension</h3>
      <div>Number of camera positions: {cameraPositions.length}</div>
      <button onClick={addCameraPosition}>Add current camera position</button>
      <div>Transition time: {transitionTime}</div>
      <input
        type="range"
        value={transitionTime}
        min={100}
        max={10000}
        onChange={(val) => setTransitionTime(Number(val.currentTarget.value))}
      />
      <div></div>
      <button onClick={flyBetweenCameraPositions}>Start flying</button>
    </div>
  );
}
