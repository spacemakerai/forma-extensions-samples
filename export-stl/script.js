import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import * as THREE from "three";
import { STLExporter } from "three/addons/exporters/STLExporter.js";

document.getElementById("run").onclick = async () => {
  try {
    const triangles = await Forma.geometry.getTriangles({ path: "root" });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(triangles, 3));
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    const exporter = new STLExporter();
    const stl = exporter.parse(mesh, { binary: true });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([stl], { type: "text/plain" }));
    link.download = "export.stl";
    link.click();
  } catch (e) {
    console.log(e);
  }
};
