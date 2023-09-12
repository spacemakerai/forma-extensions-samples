const dynamoUrl = "";

async function buildInputs(config, geometry) {
  return [
    /*{
      nodeId: "tst",
      value: JSON.stringify(config),
    },*/
    {
      nodeId: "61ac694796d9473d8c24b94c24df829f",
      value: JSON.stringify(geometry.proposal),
    },
    {
      nodeId: "ed33cc713fd944319fe1d0516b764c4b",
      value: JSON.stringify(geometry.surroudings),
    },
    {
      nodeId: "57d3a29891014ef89bac997b62da466c",
      value: JSON.stringify(geometry.constraints),
    },
  ];
}

export async function run(config, geometry) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        target: {
          type: "JsonGraphTarget",
          contents: code,
        },
        ignoreInputs: false,
        getImage: false,
        getGeometry: false,
        getContents: false,
        inputs: buildInputs(config, geometry),
      }),
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
}
