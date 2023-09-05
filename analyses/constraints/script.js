import { Forma } from "forma";
import { body } from "./request.js";

window.Forma = Forma;

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

let dynamoUrl = localStorage.getItem("dynamo-url");
const urlInput = document.getElementById("dynamo-url");

let vizualizeIndex = localStorage.getItem("visualize");

const vizualizeInput = document.getElementById("visualize");

if (dynamoUrl) {
  urlInput.value = dynamoUrl;
}

if (vizualizeIndex) {
  vizualizeInput.value = vizualizeIndex;
}

urlInput.onchange = function (e) {
  dynamoUrl = e.target.value;
  localStorage.setItem("dynamo-url", dynamoUrl);
  callDynamo();
};

vizualizeInput.onchange = function (e) {
  vizualizeIndex = e.target.value;
  localStorage.setItem("visualize", vizualizeIndex);
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
  const rootUrn = await Forma.proposal.getRootUrn();

  /*const proposal = (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "generic",
        })
      )
        .filter((path) => path.split("/").length === 2)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));*/
  const constraints = (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "constraints",
        })
      ).map((path) =>
        Forma.geometry.getTriangles({
          urn: rootUrn,
          path,
        })
      )
    )
  ).map((a) => Array.from(a));

  const proposal = [
    await Forma.geometry.getTriangles({
      urn: await Forma.proposal.getRootUrn(),
      path: "root/7de2a72",
    }),
  ].map((a) => Array.from(a));

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

let urn = null;
/*setInterval(() => {
  const curr = Forma.proposal.getRootUrn();

  if (curr !== urn) {
    urn = curr;
    callDynamo();
  }
}, 100);*/

function toNonIndexed(positions, index) {
  const res = new Float32Array(index.length * 3);

  for (let i = 0; i < index.length; i++) {
    const idx = index[i] * 3;
    res[i * 3 + 0] = positions[idx + 0];
    res[i * 3 + 1] = positions[idx + 1];
    res[i * 3 + 2] = positions[idx + 2];
  }

  return res;
}

async function render(geometry) {
  const positions = geometry.attributes.position.array;
  const index = [...geometry.getIndex().array];
  const position = filterPositions(positions);

  const nonIndexPositions = toNonIndexed(position, index);
  const color = Array(nonIndexPositions.length / 3)
    .fill([255, 0, 0, 255])
    .flat();

  await Forma.render.updateMesh({
    id: "constraints",
    geometryData: {
      position: nonIndexPositions,
      index,
      color: new Uint8Array(color),
    },
  });
}

async function callDynamo() {
  console.log("callDynamo");
  try {
    console.log("bake");
    const body = await bakeBody();

    const response = await fetch(dynamoUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const r = await response.json();

    console.log(r.geometry.length);

    if (!vizualizeIndex) {
      console.log(vizualizeIndex);
      return;
    } else {
      console.log("wat");
    }

    const geometry = r.geometry[vizualizeIndex];

    for (let entry of geometry.geometryEntries) {
      loader.load(
        "data:application/octet-stream;base64," + entry,
        async (gltf) => {
          const { geometry } = gltf.scenes[0].children[0];

          console.log("render");
          await render(geometry);
        }
      );
    }
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("run").onclick = callDynamo;
