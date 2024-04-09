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

export function FlyThrough() {
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
    <>
      <div style="width: 100%;">
        <h3>Fly-through extension</h3>
        <div>Number of camera positions: {cameraPositions.length}</div>
        <weave-button onClick={addCameraPosition} variant="outlined">
          Add current camera position
        </weave-button>
        <div>Transition time: {transitionTime}</div>
        <weave-inputslider
          onChange={(e: CustomEvent<number>) => {
            setTransitionTime(e.detail);
          }}
        >
          <weave-slider
            value={transitionTime}
            min={100}
            max={3000}
            variant="discrete"
          />
          <weave-input
            type="number"
            value={transitionTime}
            min={100}
            max={3000}
            step={100}
            unit="ms"
          />
        </weave-inputslider>
        <div />
        <weave-button onClick={flyBetweenCameraPositions}>
          Start flying
        </weave-button>
      </div>
    </>
  );
}
