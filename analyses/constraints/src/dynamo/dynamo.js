const dynamoUrl = "https://app.dynaas-c-uw2.cloudos.autodesk.com/v1/graph/run";

export async function run(code, state) {
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
        inputs: Object.entries(state).map(([nodeId, value]) => ({
          nodeId,
          value,
        })),
      }),
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
}
