import { HeightMaps } from "forma-embedded-view-sdk/prediction";
import {
  DoubleSide,
  MeshDepthMaterial,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";

const PIXEL_SIZE = 1.5; //
const RESOLUTION = 500;
const PIXEL_ARRAY_SIZE = RESOLUTION ** 2;
const FRUSTUM_SIZE = PIXEL_SIZE * RESOLUTION;
const DEPTH_RENDERER = new WebGLRenderer();
const EVEREST = 8849; // Everest
const DEAD_SEA = -431; // Dead Sea
const DEPTH_TARGET = new WebGLRenderTarget(RESOLUTION, RESOLUTION, {
  format: RGBAFormat,
});
const N_ITERATIONS = 2;
DEPTH_RENDERER.setRenderTarget(DEPTH_TARGET);

const renderPixels = (
  scene: Scene,
  center: [number, number],
  cameraHeight: number,
  viewDistance: number
) => {
  const orthographicCamera = new OrthographicCamera(
    -FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / 2,
    -FRUSTUM_SIZE / 2,
    FRUSTUM_SIZE / 2,

    0.1,
    viewDistance
  );
  // when we set the camera position to center, how big is the actual scene?
  orthographicCamera.position.set(center[0], center[1], cameraHeight);

  scene.overrideMaterial = new MeshDepthMaterial();
  scene.overrideMaterial.side = DoubleSide;
  DEPTH_RENDERER.render(scene, orthographicCamera);
  const pixels = new Uint8Array(RESOLUTION * RESOLUTION * 4);
  DEPTH_RENDERER.readRenderTargetPixels(
    DEPTH_TARGET,
    0,
    0,
    RESOLUTION,
    RESOLUTION,
    pixels
  );
  scene.overrideMaterial = null;
  return pixels;
};

const maximizeCameraPosition = (
  pixels: Uint8Array,
  prevCameraHeight: number,
  prevViewClipPosition: number
) => {
  let min = 255;
  let max = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const current = pixels[i];
    if (current === 0) continue; // ignore pixels that are not part of included geometry
    if (current < min) min = current;
    if (current > max) max = current;
  }

  const newCameraHeight =
    ((max + 0.5) * (prevCameraHeight - prevViewClipPosition)) / 255 +
    prevViewClipPosition;
  const newViewClipPosition =
    ((min - 0.5) * (prevCameraHeight - prevViewClipPosition)) / 255 +
    prevViewClipPosition;

  return { newCameraHeight, newViewClipPosition };
};

export async function generateDepthMap(
  terrainScene: Scene,
  allScene: Scene,
  centerPosition: [number, number]
): Promise<HeightMaps> {
  // optimize camera position
  console.time("depthMapProcessor");
  let cameraHeight = EVEREST; // Everest
  let viewClipPosition = DEAD_SEA - (EVEREST - DEAD_SEA) / 255; // It needs to be 254 because the depth map is 8-bit
  // move maximize camera position to constant
  for (
    let optimizationIndex = 0;
    optimizationIndex < N_ITERATIONS;
    optimizationIndex++
  ) {
    const viewDistance = cameraHeight - viewClipPosition;
    const pixels = renderPixels(
      allScene,
      centerPosition,
      cameraHeight,
      viewDistance
    );
    const { newCameraHeight, newViewClipPosition } = maximizeCameraPosition(
      pixels,
      cameraHeight,
      viewClipPosition
    );
    cameraHeight = newCameraHeight;
    viewClipPosition = newViewClipPosition;
  }

  // render pixels
  const viewDistance = cameraHeight - viewClipPosition;
  const terrainPixels = renderPixels(
    terrainScene,
    centerPosition,
    cameraHeight,
    viewDistance
  );
  const buildingPixels = renderPixels(
    allScene,
    centerPosition,
    cameraHeight,
    viewDistance
  );

  const terrainData = new Uint8Array(PIXEL_ARRAY_SIZE);
  const buildingData = new Uint8Array(PIXEL_ARRAY_SIZE);

  for (let i = 0; i < terrainData.length; i++) {
    terrainData[i] = terrainPixels[i * 4];
    buildingData[i] = buildingPixels[i * 4];
  }
  console.timeEnd("depthMapProcessor");

  return {
    terrainHeightArray: Array.from(terrainData),
    minHeight: viewClipPosition,
    maxHeight: cameraHeight,
    buildingAndTerrainHeightArray: Array.from(buildingData),
  };
}
