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
import { computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import {
  HeightMaps,
  WindParametersResponse,
} from "forma-embedded-view-sdk/predictive-analysis";
// Speed up raycasting using https://github.com/gkjohnson/three-mesh-bvh
// @ts-ignore
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const DEFAULT_COLOR_SCALE = [
  "#B2F8DA",
  "#55DCA2",
  "#FED52A",
  "#FFA900",
  "#FF463A",
];

//const DEFAULT_COLOR_SCALE2 = [
//  "#44ce1b",
//  "#bbdb44",
//  "#f7e379",
//  "#f2a134",
//  "#e51f1f",
//];

function drawOnCanvas(
  canvas: HTMLCanvasElement,
  {
    grid,
    colorScale,
    width,
    height,
  }: {
    grid: Float32Array | number[];
    colorScale?: string[];
    width: number;
    height: number;
  }
) {
  colorScale = colorScale || DEFAULT_COLOR_SCALE;
  const ctx = canvas.getContext("2d")!;
  canvas.height = height;
  canvas.width = width;

  for (let index = 0; index < grid.length; index++) {
    const column = Math.floor(index % canvas.width);
    const row = Math.floor(index / canvas.width);

    if (!isNaN(grid[index])) {
      const v = grid[index];
      const colorIndex = Math.round(v);
      ctx.fillStyle = colorScale[colorIndex];
      ctx.fillRect(column, row, 1, 1);
    }
  }
  return canvas;
}

async function calculateAndDrawWindComfort(
  heightMaps: HeightMaps,
  windRoseData: WindParametersResponse,
  position: { x: number; y: number; z: number }
) {
  const canvas = document.createElement("canvas");

  Forma.terrain.groundTexture.add({
    name: JSON.stringify(position),
    canvas,
    position,
    scale: { x: 1.5, y: 1.5 },
  });
  Forma.predictiveAnalysis
    .predictWind({
      heightMaps: heightMaps,
      windRose: {
        data: windRoseData.data,
        height: windRoseData.height,
      },
      type: "comfort",
      roughness: windRoseData.roughness,
      comfortScale: "lawson_lddc",
    })
    .then((data) => {
      const canvas = document.createElement("canvas");
      drawOnCanvas(canvas, {
        grid: data.grid,
        width: data.width,
        height: data.height,
      });
      Forma.terrain.groundTexture.add({
        name: JSON.stringify(position) + "result",
        canvas,
        position,
        scale: data.scale,
      });
    });
}

export function App() {
  const [windRoseData, setWindRoseData] = useState<any | null>(null);
  const [terrainBufferGeometry, setTerrainBufferGeometry] =
    useState<BufferGeometry | null>(null);
  const [allBufferGeometry, setAllBufferGeometry] =
    useState<BufferGeometry | null>(null);

  useEffect(() => {
    console.log(Forma);
    Forma.predictiveAnalysis.getWindParameters().then((data) => {
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
        // @ts-ignore
        terrainGeometry.computeBoundsTree();
        setTerrainBufferGeometry(terrainGeometry);
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
        // @ts-ignore
        allGeometry.computeBoundsTree();
        setAllBufferGeometry(allGeometry);
      });
  }, []);

  useEffect(() => {
    if (windRoseData && allBufferGeometry && terrainBufferGeometry) {
      const allScene = new Scene();

      allScene.add(
        new Mesh(allBufferGeometry, new MeshBasicMaterial({ color: 0xff0000 }))
      );

      const terrainScene = new Scene();

      terrainScene.add(
        new Mesh(
          terrainBufferGeometry,
          new MeshBasicMaterial({ color: 0xff0000 })
        )
      );

      for (let x = 0; x <= 500; x += 200) {
        for (let y = 0; y <= 500; y += 200) {
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
