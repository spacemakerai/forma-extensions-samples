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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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
        <forma-expanded-tooltip
          target-id="fly-through-button"
          text="Fly-through"
          loadingduration="100"
          help-url="https://github.com/spacemakerai/forma-extensions-samples"
          position="bottom"
        >
          <p>
            The fly through extension allows you to define different camera
            positions and create a fly by in the scene with your desired
            transition time
          </p>
        </forma-expanded-tooltip>
        <weave-button
          id="fly-through-button"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="solid"
          width="100%"
        >
          Fly-through the scene
        </weave-button>
      </div>
      {isExpanded && (
        <div style="width: 100%;">
          <h3>Fly-through extension</h3>
          <div>Number of camera positions: {cameraPositions.length}</div>
          <weave-button onClick={addCameraPosition} variant="outlined">
            Add current camera position
          </weave-button>
          <div>Transition time: {transitionTime}</div>
          <weave-inputslider
            onChange={(e: CustomEvent) => {
              console.log(e.detail);
              setTransitionTime(parseInt(e.detail));
            }}
          >
            <weave-slider
              value={transitionTime}
              min={100}
              max={3000}
              variant="discrete"
            ></weave-slider>
            <weave-input
              type="number"
              value={transitionTime}
              min={100}
              max={3000}
              step={100}
              unit="ms"
            />
          </weave-inputslider>
          <div></div>
          <weave-button onClick={flyBetweenCameraPositions}>
            Start flying
          </weave-button>
        </div>
      )}
    </>
  );
}
