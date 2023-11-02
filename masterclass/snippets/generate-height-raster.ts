import * as THREE from "three";

const raycaster = new THREE.Raycaster();

export async function generateRaster(
  terrainScene: THREE.Scene,
  allScene: THREE.Scene,
  centerPosition: [number, number]
): Promise<HeightMaps> {
  console.time("generateRaster");
  const direction = new THREE.Vector3(0, 0, -1);
  //@ts-ignore
  const terrainResult = [];
  const allResult = [];
  for (let y = 249.5; y > -250.5; y--) {
    for (let x = -249.5; x < 250.5; x++) {
      const origin = new THREE.Vector3(
        x * 1.5 + centerPosition[0],
        y * 1.5 + centerPosition[1],
        10000
      );
      raycaster.set(origin, direction);
      const terrainIntersection = raycaster.intersectObjects(
        terrainScene.children
      )[0];
      const allIntersection = raycaster.intersectObjects(allScene.children)[0];

      terrainResult.push(terrainIntersection.point.z);
      allResult.push(allIntersection.point.z);
    }
  }
  const allMinMax = getMinMax(allResult.concat(terrainResult));
  const scaledTerrainResult = new Uint8Array(terrainResult.length);
  const scaledAllResult = new Uint8Array(allResult.length);
  for (let i = 0; i < allResult.length; i++) {
    scaledTerrainResult[i] = Math.round(
      ((terrainResult[i] - allMinMax[0]) / (allMinMax[1] - allMinMax[0])) * 255
    );
    scaledAllResult[i] = Math.round(
      ((allResult[i] - allMinMax[0]) / (allMinMax[1] - allMinMax[0])) * 255
    );
  }
  console.timeEnd("generateRaster");
  return {
    terrainHeightArray: Array.from(scaledTerrainResult),
    minHeight: allMinMax[0],
    maxHeight: allMinMax[1],
    buildingAndTerrainHeightArray: Array.from(scaledAllResult),
  };
}
