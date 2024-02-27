import { HeightMaps } from "forma-embedded-view-sdk/predictive-analysis";
import * as THREE from "three";
import { acceleratedRaycast } from "three-mesh-bvh";

THREE.Mesh.prototype.raycast = acceleratedRaycast;
const raycaster = new THREE.Raycaster();
// For this analysis we only need the first hit, which is faster to compute
// @ts-ignore
raycaster.firstHitOnly = true;

function getMinMax(array: number[]) {
  return array.reduce(
    ([min, max], val) => [Math.min(min, val), Math.max(max, val)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );
}

/**
 * Simple approach to generates height maps using raycasting in three.js
 * @param terrainScene a THREE scene containing only the terrain the terrain
 * @param allScene  a THREE scene containing terrain and volumes
 * @param centerPosition The center position you want height maps for
 * @returns Column major height maps with 500x500 grid points and a resolution of 1.5m.
 */
export function generateHeightMaps(
  terrainScene: THREE.Scene,
  allScene: THREE.Scene,
  centerPosition: [number, number]
): HeightMaps {
  console.time("generateHeightMaps");
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
      console.log(x, y);
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
  console.timeEnd("generateHeightMaps");
  return {
    terrainHeightArray: Array.from(scaledTerrainResult),
    minHeight: allMinMax[0],
    maxHeight: allMinMax[1],
    buildingAndTerrainHeightArray: Array.from(scaledAllResult),
  };
}
