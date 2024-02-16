import { Forma } from "forma-embedded-view-sdk/auto";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getMeshes } from "./lib/utils";
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

function render() {
  requestAnimationFrame(render);
  lightHelper.update();
  renderer.clear();
  renderer.render(scene, camera);
}

const webglCanvas = document.getElementById("webgl");
if (!webglCanvas) {
  throw new Error("No canvas found");
}
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: webglCanvas,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  10,
  5000
);

const viewLight = new THREE.SpotLight("#ffcccc", 4, 2000);
viewLight.castShadow = true;

viewLight.shadow.camera.fov = 45;
viewLight.shadow.camera.near = 10;
viewLight.shadow.camera.far = 2000;
viewLight.shadow.mapSize.width = 2048;
viewLight.shadow.mapSize.height = 2048;
viewLight.decay = 0;

const lightTarget = new THREE.Object3D();
viewLight.target = lightTarget;

window.addEventListener("resize", onWindowResize);

const scene = new THREE.Scene();

scene.add(viewLight);
scene.add(lightTarget);

const lightHelper = new THREE.SpotLightHelper(viewLight);
scene.add(lightHelper);

const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
scene.add(ambientLight);

render();

/**
 * Radar effect
 */
let degrees = 0;
setInterval(() => {
  viewLight.target.position.set(
    viewLight.position.x + 200 * Math.cos(((degrees % 360) * Math.PI) / 180),
    viewLight.position.y + 200 * Math.sin(((degrees % 360) * Math.PI) / 180),
    viewLight.position.z
  );
  degrees += 15;
}, 150);

/**
 * Sync camera from Forma
 */
Forma.camera.getCurrent().then((cameraState) => {
  camera.position.set(
    cameraState.position.x,
    cameraState.position.y,
    cameraState.position.z
  );
  camera.lookAt(
    cameraState.target.x,
    cameraState.target.y,
    cameraState.target.z
  );
});
Forma.camera.subscribe((cameraState) => {
  camera.position.set(
    cameraState.position.x,
    cameraState.position.y,
    cameraState.position.z
  );
  camera.lookAt(
    cameraState.target.x,
    cameraState.target.y,
    cameraState.target.z
  );
});

/** Retrieve current scene when loading the extension */
getMeshes().then((meshes) => {
  meshes.forEach((mesh) => {
    scene.add(mesh);
  });
});

/**
 * Continously ask for input point from the user
 */
while (true) {
  await Forma.designTool.getPoint().then((point) => {
    if (point) {
      viewLight.position.set(
        point.x,
        point.y,
        // 1.75 meters above the ground makes sense when selecting a point on the ground, but not facade.
        // For ground that would be around the height of a person.
        point.z + 1.75
      );
    }
  });
}

export function App() {
  return <></>;
}
