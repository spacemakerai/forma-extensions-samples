const dynamoUrl = "https://app.dynaas-c-uw2.cloudos.autodesk.com/v1/graph/run";

const controllers = {};

// Generate 20 chars hash of object
function hash(obj) {
  return JSON.stringify(obj)
    .split("")
    .reduce((acc, char) => (acc = (acc << 5) - acc + char.charCodeAt(0)), 0);
}

export async function run(code, state) {
  const hashId = hash(code);
  if (!controllers[hashId]) controllers[hashId] = new AbortController();
  let controller = controllers[hashId];

  controller.abort("aborting previous request");
  setTimeout(() => controller.abort("timeout"), 30000);
  controller = new AbortController();
  const { signal } = controller;
  try {
    const response = await fetch(dynamoUrl, {
      signal,
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
        inputs: Object.entries(state).map(([nodeId, value]) => ({
          nodeId,
          value,
        })),
      }),
    });

    return { data: await response.json(), type: "success" };
  } catch (e) {
    if (e.name === "AbortError") {
      if (signal.reason === "aborting previous request") {
        return { type: "aborted" };
      } else {
        throw Error("Request timed out after 30 seconds");
      }
    } else {
      throw e;
    }
  }
}
