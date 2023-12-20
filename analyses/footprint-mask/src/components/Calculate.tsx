import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import { useCallback } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";

const colors = ["rgba(255, 0, 0, 0.9)", "rgba(23, 115, 13, 0.9)"];

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

export const SCALE = 1;
// width and height in pixels
const width = 1000;
const height = 1000;
// Top left corner in meters
const x0 = -250;
const y0 = 250;

export default function CalculateAndDraw() {
  const calculateFootprint = useCallback(async () => {
    const terrainPaths = await Forma.geometry.getPathsByCategory({
      category: "terrain",
    });
    const constraintPaths = await Forma.geometry.getPathsByCategory({
      category: "constraints",
    });
    const vegetationPaths = await Forma.geometry.getPathsByCategory({
      category: "vegetation",
    });
    const triangles = await Forma.geometry.getTriangles({excludedPaths: [...terrainPaths, ...vegetationPaths, ...constraintPaths]});
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(triangles, 3));
    const material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;

    //@ts-ignore
    geometry.computeBoundsTree();

    const mesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Scene();
    scene.add(mesh);

    const direction = new THREE.Vector3(0, 0, -1);
    const origin = new THREE.Vector3(0, 0, 10000);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < height; i++) {
      origin.y = y0 - SCALE / 2 - SCALE * i;
      for (let j = 0; j < width; j++) {
        origin.x = x0 + SCALE / 2 + SCALE * j;
        raycaster.set(origin, direction);
        const intersection = raycaster.intersectObjects(scene.children);
        ctx!.fillStyle = colors[intersection.length === 0 ? 0 : 1];
        ctx!.fillRect(j, i, 1, 1);
      }
    }

    const position = {
      x: x0 + (width * SCALE) / 2,
      y: y0 - (height * SCALE) / 2,
      z: 1, // need to put the texture higher up than original
    };

    await Forma.terrain.groundTexture.add({
      name: "footprint_mask",
      canvas,
      position,
      scale: { x: SCALE, y: SCALE },
    });
  }, []);

  return (
    <button onClick={calculateFootprint} style="width: 100%;">
      Calculate and visualize footprint mask
    </button>
  );
}
