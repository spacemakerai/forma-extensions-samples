import { Forma } from "forma-embedded-view-sdk/auto";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";

import {
  BufferGeometry,
  BufferAttribute,
  Mesh,
  Raycaster,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { useCallback, useEffect } from "preact/hooks";

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

const raycaster = new Raycaster();

async function runAnalysis(triangles) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(triangles, 3));
  const mesh = new Mesh(geometry, new MeshBasicMaterial());

  const { min, max } = await Forma.terrain.getBbox();

  const [width, height] = [Math.ceil(max.x - min.x), Math.ceil(max.y - min.y)];

  const grid = new Float32Array(width * height);
  // Assuming scale = 1 meter
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const x = min.x + i;
      const y = min.y + j;

      const position = new Vector3(x, y, max.z + 1);
      const direction = new Vector3(0, 0, -1);

      const intersection = raycaster.intersectObject(
        [mesh],
        position,
        direction
      );

      if (intersection) {
        const { normal } = intersection.face;

        const slope = Math.abs(
          Math.PI / 2 -
            Math.atan(
              normal.z /
                Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2))
            )
        );
        grid[i * height + j] = slope;
      }
    }
  }
  return { grid, height, width, scale: { x: 1, y: 0 }, x0: min.x, y0: min.y };
}

const colors = [
  "rgba(169, 189, 5, 0.9)",
  "rgba(153, 181, 6, 0.9)",
  "rgba(136, 172, 7, 0.9)",
  "rgba(39, 123, 12, 0.9)",
  "rgba(120, 164, 8, 0.9)",
  "rgba(104, 156, 9, 0.9)",
  "rgba(88, 148, 9, 0.9)",
  "rgba(72, 140, 10, 0.9)",
  "rgba(55, 131, 11, 0.9)",
  "rgba(23, 115, 13, 0.9)",
];

function createCanvas({ grid, width, height, scale }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < grid.length; i++) {
    const x = Math.floor(i % width);
    const y = Math.floor(i / width);
    ctx!.fillStyle = colors[Math.floor((grid[i] / Math.PI) * colors.length)];
    ctx!.fillRect(x, y, scale.x, scale.y);
  }

  return canvas;
}

export function App() {
  const run = useCallback(async () => {
    const [path] = await Forma.geometry.getPathsByCategory({
      category: "terrain",
    });

    const triangles = await Forma.geometry.getTriangles({ path });

    const result = await runAnalysis(triangles);

    const canvas = createCanvas(result);

    await Forma.terrain.groundTexture.add({
      name: "steepness",
      canvas,
      position: {
        x: result.x0 + result.width / 2,
        y: result.y0 + result.height / 2,
        z: 29,
      },
      scale: result.scale,
    });
  }, []);

  return (
    <h1>
      Steepness
      <button onClick={run}>Run analysis</button>
    </h1>
  );
}
