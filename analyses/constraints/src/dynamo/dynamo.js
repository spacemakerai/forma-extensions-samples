const dynamoUrl = "https://app.dynaas-c-uw2.cloudos.autodesk.com/v1/graph/run";
import code from "./script.js";

async function buildInputs(config, geometry) {
  return [
    {
      nodeId: "f3e2d30403324d74bac56b6d0e7b7472",
      value: JSON.stringify(config || {}),
    },
    {
      nodeId: "f3e2d30403324d74bac56b6d0e7b7473",
      value: JSON.stringify(geometry.proposal || []),
    },
    {
      nodeId: "ed33cc713fd944319fe1d0516b764c4b",
      value: JSON.stringify(geometry.surroudings || []),
    },
    {
      nodeId: "ac0733e3121e4fb4a90ce1990060c4be",
      value: JSON.stringify(geometry.siteLimits || []),
    },
    {
      nodeId: "ac0733e3121e4fb4a90ce1990060c4bd",
      value: JSON.stringify(geometry.constraints || []),
    },
  ];
}

export async function run(config, geometry) {
  try {
    const response = await fetch(dynamoUrl, {
      method: "POST",
      body: JSON.stringify({
        target: {
          type: "JsonGraphTarget",
          contents: JSON.stringify(code),
        },
        ignoreInputs: false,
        getImage: false,
        getGeometry: false,
        getContents: false,
        inputs: await buildInputs(config, geometry),
      }),
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
}
