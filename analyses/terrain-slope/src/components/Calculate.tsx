import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import { createCanvasFromSlope, degreesToRadians } from "../utils";
import { useCallback } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { CANVAS_NAME, RESOLUTION } from "../app";

type Props = {
  steepnessThreshold: number;
};

function getMinMax(array: Float32Array) {
  // return [Math.min(array)]
  return array.reduce(
    (acc, curr) => {
      acc[0] = Math.min(acc[0], curr);
      acc[1] = Math.max(acc[1], curr);
      return acc;
    },
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );
}

// Speed up raycasting using https://github.com/gkjohnson/three-mesh-bvh
// @ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
// @ts-ignore
THREE.Mesh.prototype.raycast = acceleratedRaycast;
const raycaster = new THREE.Raycaster();
// For this analysis we only need the first hit, which is faster to compute
// @ts-ignore
raycaster.firstHitOnly = true;

function arrayToBuffer(array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(array.length * Float32Array.BYTES_PER_ELEMENT);
  const arr = new Float32Array(buffer);
  arr.set(array);
  return arr;
}

export default function CalculateAndStore({ steepnessThreshold }: Props) {
  const calculateTerrainSteepness = useCallback(async () => {
    const [terrain] = await Forma.geometry.getPathsByCategory({
      category: "terrain",
    });

    const terrainTriangles = await Forma.geometry.getTriangles({
      path: terrain,
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(terrainTriangles, 3)
    );

    //@ts-ignore
    geometry.computeBoundsTree();

    const material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geometry, material);

    const scene = new THREE.Scene();
    scene.add(mesh);

    const xValues = terrainTriangles.filter((_, i) => i % 3 === 0);
    const [minX, maxX] = getMinMax(xValues);
    const yValues = terrainTriangles.filter((_, i) => i % 3 === 1);
    const [minY, maxY] = getMinMax(yValues);

    const width = Math.floor((maxX - minX) / RESOLUTION);
    const height = Math.floor((maxY - minY) / RESOLUTION);
    const direction = new THREE.Vector3(0, 0, -1);
    const origin = new THREE.Vector3(0, 0, 10000);

    let [minSlope, maxSlope] = [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];
    let terrainSlope = new Float32Array(width * height).fill(NaN);
    for (let i = 0; i < height; i++) {
      origin.y = maxY - RESOLUTION / 2 - RESOLUTION * i;
      for (let j = 0; j < width; j++) {
        origin.x = minX + RESOLUTION / 2 + RESOLUTION * j;
        raycaster.set(origin, direction);
        const intersection = raycaster.intersectObjects(scene.children)[0];
        const normal = intersection!.face!.normal;
        const slope = Math.abs(
          Math.PI / 2 -
            Math.atan(
              normal.z /
                Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2))
            )
        );
        terrainSlope[i * width + j] = slope;
        minSlope = Math.min(slope, minSlope);
        maxSlope = Math.max(slope, maxSlope);
      }
    }

    const canvas = createCanvasFromSlope(
      terrainSlope,
      width,
      height,
      maxSlope,
      minSlope,
      degreesToRadians(steepnessThreshold)
    );
    const position = {
      x: ((maxX + minX) * RESOLUTION) / 2,
      y: ((maxY + minY) * RESOLUTION) / 2,
      z: 29,
    };

    await Forma.terrain.groundTexture.add({
      name: CANVAS_NAME,
      canvas,
      position,
      scale: { x: 1, y: 1 },
    });
    await Forma.extensions.storage.setObject({
      key: "terrain-steepness-png",
      metadata: JSON.stringify({
        steepnessThreshold: steepnessThreshold,
        minX,
        maxX,
        minY,
        maxY,
      }),
      data: canvas.toDataURL(),
    });
    await Forma.extensions.storage.setObject({
      key: "terrain-steepness-raw",
      metadata: JSON.stringify({
        minSlope,
        maxSlope,
        width,
        height,
        minX,
        maxX,
        minY,
        maxY,
      }),
      data: arrayToBuffer(terrainSlope),
    });
  }, [steepnessThreshold]);

  return (
    <button onClick={calculateTerrainSteepness} style="width: 100%;">
      Calculate and store results
    </button>
  );
}
