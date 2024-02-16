import { Forma } from "forma-embedded-view-sdk/auto";
import * as THREE from "three";

/**
 *
 * @returns A three.js scene with the geometry current proposal in the Forma SDK
 */
export async function getMeshes(): Promise<THREE.Object3D[]> {
  const excludedPaths = await Forma.geometry.getPathsForVirtualElements();
  const terrainPaths = await Forma.geometry.getPathsByCategory({
    category: "terrain",
  });

  const triangles = await Forma.geometry.getTriangles({
    excludedPaths: [...excludedPaths, ...terrainPaths],
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(triangles, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshLambertMaterial({
    color: "#ffffff",
  });
  material.side = THREE.DoubleSide;
  const volumeMesh = new THREE.Mesh(geometry, material);
  volumeMesh.castShadow = true;
  volumeMesh.receiveShadow = true;

  const terrainTriangles = await Forma.geometry.getTriangles({
    path: terrainPaths[0],
  });
  const terrainGeometry = new THREE.BufferGeometry();

  terrainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(terrainTriangles, 3)
  );
  terrainGeometry.computeVertexNormals();
  const terrainMesh = new THREE.Mesh(terrainGeometry, material);
  terrainMesh.castShadow = true;
  terrainMesh.receiveShadow = true;

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 45);
  const edges = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({
      color: "#d1e0e0",
      opacity: 0.2,
      transparent: true,
    })
  );
  edges.receiveShadow = true;

  return [volumeMesh, terrainMesh, edges];
}
