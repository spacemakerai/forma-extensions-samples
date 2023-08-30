import formaApi from "https://app.autodeskforma.eu/extensions/preview/sdk.js";
import { body } from "./request.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

let dynamoUrl = localStorage.getItem("dynamo-url");
const urlInput = document.getElementById("dynamo-url");

if (dynamoUrl) {
  urlInput.value = dynamoUrl;
}

urlInput.onchange = function (e) {
  dynamoUrl = e.target.value;
  localStorage.setItem("dynamo-url", dynamoUrl);
};

function filterPositions(array) {
  const res = new Float32Array(array.length / 2);
  let idx = 0;

  for (let i = 0; i < array.length; i += 6) {
    res[idx + 0] = array[i + 0];
    res[idx + 1] = -array[i + 2];
    res[idx + 2] = array[i + 1];
    idx += 3;
  }
  return res;
}

async function bakeBody() {
  const proposal = (
    await Promise.all(
      (await formaApi.getPathsByCategory("generic"))
        .filter((path) => path.split("/").length === 2)
        .map((path) => formaApi.geometry.getTriangles(path))
    )
  ).map((a) => Array.from(a));
  const constraints = (
    await Promise.all(
      (
        await formaApi.getPathsByCategory("constraints")
      ).map((path) => formaApi.geometry.getTriangles(path))
    )
  ).map((a) => Array.from(a));

  return {
    ...body,
    inputs: [
      {
        nodeId: "57d3a29891014ef89bac997b62da466c",
        value: JSON.stringify(constraints),
      },
      {
        nodeId: "61ac694796d9473d8c24b94c24df829f",
        value: JSON.stringify(proposal),
      },
    ],
  };
}

callDynamo();
formaApi.addEventListener("model", () => {
  callDynamo();
});

async function callDynamo() {
  try {
    await formaApi.draw.mesh.remove("constraint-violation");

    const body = await bakeBody();

    console.log(body);
    return;

    const response = await fetch(dynamoUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const r = await response.json();

    const geometry = r.geometry[12];
    for (let entry of geometry.geometryEntries) {
      loader.load("data:application/octet-stream;base64," + entry, (gltf) => {
        const positions =
          gltf.scenes[0].children[0].geometry.attributes.position.array;

        formaApi.draw.mesh.add("constraint-violation", {
          position: filterPositions(positions),
          index: [...gltf.scenes[0].children[0].geometry.getIndex().array],
          color: new Uint8Array(
            Array(
              gltf.scenes[0].children[0].geometry.attributes.position.array
                .length
            )
              .fill([255, 0, 0, 255])
              .flat()
          ),
        });
      });
    }
  } catch (e) {
    console.error(e);
  }
}
