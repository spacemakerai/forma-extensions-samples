import { Forma } from "forma-embedded-view-sdk/auto";
import * as THREE from "three";
import { generateHeightMaps } from "./raycastProcessor.ts";
import { computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import { PredictiveAnalysisGroundGrid } from "forma-embedded-view-sdk/predictive-analysis";

// Speed up raycasting using https://github.com/gkjohnson/three-mesh-bvh
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

export async function predictWind() {
  const infoElement = document.getElementById("info") as HTMLDivElement;
  infoElement.innerHTML = "Click on the map to predict wind";
  const position = await Forma.designTool.getPoint();
  if (!position) {
    console.log("need a position");
    return;
  }
  infoElement.innerHTML = `Predicting wind at ${position.x.toFixed(
    2,
  )}, ${position.y.toFixed(2)}. It might take a second or two...`;

  const [windParameters, terrainScene, allScene] = await Promise.all([
    Forma.predictiveAnalysis.getWindParameters(),
    getSceneWithTerrain(),
    getSceneWithoutVirtual(),
  ]);

  const heightMaps = generateHeightMaps(terrainScene, allScene, [
    position.x,
    position.y,
  ]);

  const comfortScale = (
    document.getElementById("comfortScale") as HTMLSelectElement
  ).value as "lawson_lddc" | "davenport" | "nen8100";

  const predictionResult = await Forma.predictiveAnalysis.predictWind({
    heightMaps,
    windRose: {
      data: windParameters.data,
      height: windParameters.height,
    },
    type: "comfort",
    roughness: windParameters.roughness,
    comfortScale,
  });

  const canvas = gridToCanvas(predictionResult);
  Forma.terrain.groundTexture.add({
    name: "Wind Prediction",
    canvas,
    position,
    scale: predictionResult.scale,
  });
  Forma.colorbar.add({
    colors: ["#B2F8DA", "#55DCA2", "#FED52A", "#FFA900", "#FF463A"],
    labels: ["Sitting", "Standing", "Strolling", "Walking", "Uncomfortable"],
    labelPosition: "center",
  });
  infoElement.innerHTML = "Wind prediction added to the map";
}

const button = document.getElementById("predictButton");
if (button) {
  button.onclick = predictWind;
}

const colorScale = ["#B2F8DA", "#55DCA2", "#FED52A", "#FFA900", "#FF463A"];

function gridToCanvas({ grid, width, height }: PredictiveAnalysisGroundGrid) {
  const canvas = document.createElement("canvas");
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

async function getSceneWithTerrain() {
  const terrainScene = new THREE.Scene();
  const terrainPath = await Forma.geometry.getPathsByCategory({
    category: "terrain",
  });
  const terrainVertexPositions = await Forma.geometry.getTriangles({
    path: terrainPath[0],
  });
  const terrainGeometry = new THREE.BufferGeometry();
  terrainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(terrainVertexPositions, 3),
  );
  terrainGeometry.computeBoundsTree();
  terrainScene.add(
    new THREE.Mesh(
      terrainGeometry,
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    ),
  );
  return terrainScene;
}

async function getSceneWithoutVirtual() {
  const virtualPaths = await Forma.geometry.getPathsForVirtualElements();
  const allScene = new THREE.Scene();
  const allGeometryVertexPositions = await Forma.geometry.getTriangles({
    path: "root",
    excludedPaths: virtualPaths,
  });
  const allGeometry = new THREE.BufferGeometry();
  allGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(allGeometryVertexPositions, 3),
  );
  allGeometry.computeBoundsTree();
  allScene.add(
    new THREE.Mesh(
      allGeometry,
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    ),
  );
  return allScene;
}
