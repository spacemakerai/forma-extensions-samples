import { useEffect, useState } from "preact/hooks";
import "./app.css";
import { generateDepthMap } from "./depthMapProcessor";
import { Forma } from "forma-embedded-view-sdk/auto";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Scene,
} from "three";

const DEFAULT_COLOR_SCALE = [
  "#B2F8DA",
  "#55DCA2",
  "#FED52A",
  "#FFA900",
  "#FF463A",
];
const arrayMinMax = (array: Float32Array) =>
  array.reduce(
    ([min, max], value) => [Math.min(min, value), Math.max(max, value)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );
function drawOnCanvas(
  canvas: HTMLCanvasElement,
  {
    grid,
    colorScale,
    width,
    height,
  }: {
    grid: Float32Array;
    colorScale?: string[];
    width: number;
    height: number;
  }
) {
  colorScale = colorScale || DEFAULT_COLOR_SCALE;
  const ctx = canvas.getContext("2d")!;
  canvas.height = height;
  canvas.width = width;
  const [minValue, maxValue] = arrayMinMax(grid.filter((v) => !isNaN(v)));

  for (let k = 0; k < grid.length; k++) {
    const i = Math.floor(k % canvas.width);
    const j = Math.floor(k / canvas.width);

    if (!isNaN(grid[k])) {
      const v = grid[k];
      const scaledValue = (v - minValue) / (maxValue - minValue);
      const colorIndex = Math.min(
        Math.floor(scaledValue * colorScale.length),
        colorScale.length - 1
      );
      ctx.fillStyle = colorScale[colorIndex];
      ctx.fillRect(i, j, 1, 1);
    }
  }
  return canvas;
}

async function calculateAndDrawWindComfort(
  depthMap: any,
  windRoseData: any,
  position: { x: number; y: number; z: number }
) {
  Forma.rapidWind
    .calculateWindComfort({
      ...depthMap,
      windRose: { data: windRoseData.data, height: windRoseData.height },
      roughness: windRoseData.roughness,
    })
    .then((data) => {
      console.log(data);
      const canvas = document.createElement("canvas");
      drawOnCanvas(canvas, {
        grid: data.grid,
        width: data.meta.width,
        height: data.meta.height,
      });
      Forma.terrain.groundTexture.add({
        name: JSON.stringify(position),
        canvas,
        position,
        scale: { x: data.meta.resolution, y: data.meta.resolution },
      });
    });
}

export function App() {
  const [windRoseData, setWindRoseData] = useState<any | null>(null);
  const [terrainScene, setTerrainScene] = useState<Scene | null>(null);
  const [allScene, setAllScene] = useState<Scene | null>(null);

  useEffect(() => {
    console.log(Forma);
    Forma.rapidWind.getWindRoseData().then((data) => {
      console.log(data);
      setWindRoseData(data);
    });
  }, []);

  useEffect(() => {
    Forma.geometry
      .getPathsByCategory({
        category: "terrain",
      })
      .then((terrainPaths) =>
        Forma.geometry.getTriangles({
          path: terrainPaths[0],
        })
      )
      .then((terrainVertexPositions) => {
        const terrainGeometry = new BufferGeometry();
        terrainGeometry.setAttribute(
          "position",
          new BufferAttribute(terrainVertexPositions, 3)
        );
        const terrainScene = new Scene();

        terrainScene.add(
          new Mesh(terrainGeometry, new MeshBasicMaterial({ color: 0xff0000 }))
        );
        setTerrainScene(terrainScene);
      });
  }, []);

  useEffect(() => {
    Forma.geometry
      .getTriangles({
        path: "root",
      })
      .then((terrainVertexPositions) => {
        const allGeometry = new BufferGeometry();
        allGeometry.setAttribute(
          "position",
          new BufferAttribute(terrainVertexPositions, 3)
        );
        const allScene = new Scene();

        allScene.add(
          new Mesh(allGeometry, new MeshBasicMaterial({ color: 0xff0000 }))
        );
        setAllScene(allScene);
      });
  }, []);

  useEffect(() => {
    if (windRoseData && allScene && terrainScene) {
      for (let x = 0; x <= 200; x += 200) {
        for (let y = 0; y <= 200; y += 200) {
          generateDepthMap(terrainScene, allScene, [x, y]).then((depthMap) => {
            calculateAndDrawWindComfort(depthMap, windRoseData, {
              x,
              y,
              z: 29,
            });
          });
          if (x != 0 || y != 0) {
            generateDepthMap(terrainScene, allScene, [-x, y]).then(
              (depthMap) => {
                calculateAndDrawWindComfort(depthMap, windRoseData, {
                  x: -x,
                  y,
                  z: 29,
                });
              }
            );
            generateDepthMap(terrainScene, allScene, [-x, -y]).then(
              (depthMap) => {
                calculateAndDrawWindComfort(depthMap, windRoseData, {
                  x: -x,
                  y: -y,
                  z: 29,
                });
              }
            );
            generateDepthMap(terrainScene, allScene, [x, -y]).then(
              (depthMap) => {
                calculateAndDrawWindComfort(depthMap, windRoseData, {
                  x: x,
                  y: -y,
                  z: 29,
                });
              }
            );
          }
        }
      }
    }
  }, [windRoseData]);

  return (
    <>
      <div>Hello</div>
    </>
  );
}
