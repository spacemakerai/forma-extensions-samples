import { useEffect, useState } from "preact/hooks";
import "./app.css";
import { Forma } from "forma-embedded-view-sdk/auto";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Scene,
} from "three";
import { computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import { biggerGenerateDepthMap } from "./biggerDepthMapProcessor";
// Speed up raycasting using https://github.com/gkjohnson/three-mesh-bvh
// @ts-ignore
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

export function RenderDepthMap() {
  const [allBufferGeometry, setAllBufferGeometry] =
    useState<BufferGeometry | null>(null);

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
        setAllBufferGeometry(allGeometry);
      });
  }, []);

  useEffect(() => {
    if (allBufferGeometry) {
      console.time("everything");
      const allScene = new Scene();

      allScene.add(new Mesh(allBufferGeometry, new MeshBasicMaterial()));
      biggerGenerateDepthMap(allScene, [0, 0]).then((depthMap) => {
        const imageData = new ImageData(
          new Uint8ClampedArray(depthMap.data),
          depthMap.width,
          depthMap.height
        );
        createImageBitmap(imageData, { imageOrientation: "flipY" }).then(
          (imageBitmap) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.height = depthMap.height;
            canvas.width = depthMap.width;
            ctx.drawImage(imageBitmap, 0, 0);
            Forma.terrain.groundTexture.add({
              name: "test",
              canvas,
              position: { x: 0, y: 0, z: 30 },
              scale: { x: depthMap.resolution, y: depthMap.resolution },
            });
            ctx.restore();
            console.timeEnd("everything");
          }
        );
      });
    }
  }, [allBufferGeometry]);

  return (
    <>
      <div>Hello</div>
    </>
  );
}
