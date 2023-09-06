import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";
import { body } from "./request.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { h, render } from "https://esm.sh/preact";
import { useState, useCallback, useEffect } from "https://esm.sh/preact/compat";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
const html = htm.bind(h);
const loader = new GLTFLoader();

window.Forma = Forma;

function RenderGeometry({ geometry, active, onToggleActive }) {
  const onEnter = useCallback(async () => {
    const geometryData = await generateGeometry(geometry.geometryEntries[0]);

    if (geometryData) {
      await Forma.render.updateMesh({
        id: geometry.id,
        geometryData,
      });
    }
  });

  useEffect(async () => {
    if (active[geometry.id]) {
      const geometryData = await generateGeometry(geometry.geometryEntries[0]);
      if (geometryData) {
        await Forma.render.updateMesh({
          id: geometry.id,
          geometryData,
        });
      }
    }
  }, [active]);

  const onExit = useCallback(async () => {
    const geometryData = await generateGeometry(geometry.geometryEntries[0]);
    if (!active[geometry.id] && geometryData)
      await Forma.render.remove({
        id: geometry.id,
      });
  });

  return html`
    <button
      class=${active[geometry.id] ? "selected" : ""}
      onmouseenter=${onEnter}
      onmouseleave=${onExit}
      onclick=${() => onToggleActive(geometry.id)}
    >
      ${geometry.id.substring(0, 10)}
    </button>
  `;
}

function RenderGeometries({ geometry, active, onToggleActive }) {
  return html`
    Output:
    ${(geometry || []).map(
      (geometry) =>
        html` <${RenderGeometry}
          geometry=${geometry}
          active=${active}
          onToggleActive=${onToggleActive}
        />`
    )}
  `;
}

let initialActive = {};
try {
  initialActive = JSON.parse(
    localStorage.getItem(`dynamo-active-${Forma.getProjectId()}}`) || "{}"
  );
} catch (e) {
  console.warn("Errornous cache value for dynamo-active ignored");
}

let initialConfig = {};
try {
  initialConfig = JSON.parse(
    localStorage.getItem(`dynamo-config-${Forma.getProjectId()}}`) || "{}"
  );
} catch (e) {
  console.warn("Errornous cache value for dynamo-config ignored");
}

function DynamoRunner({ url }) {
  const [active, setActive] = useState(initialActive);
  const [geometry, setGeometry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(initialConfig);

  useEffect(async () => {
    let rootUrn = await Forma.proposal.getRootUrn();
    const id = setInterval(async () => {
      const urn = await Forma.proposal.getRootUrn();
      if (urn !== rootUrn) {
        setIsLoading(true);
        setGeometry(null);
        setGeometry(await callDynamo(url));
        setIsLoading(false);
        rootUrn = urn;
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const onToggleActive = useCallback(
    (id) => {
      const updated = { ...active, [id]: !active[id] };
      setActive(updated);
      localStorage.setItem(
        `dynamo-active-${Forma.getProjectId()}}`,
        JSON.stringify(updated)
      );
    },
    [active]
  );

  useEffect(async () => {
    setIsLoading(true);
    setGeometry(await callDynamo(url, config));
    setIsLoading(false);
  }, []);

  const downloadRequest = useCallback(async () => {
    const body = await bakeBody(config);

    const save_link = document.createElement("a");
    save_link.href = `data:application/json;${JSON.stringify(body)}`;
    save_link.download = (await Forma.proposal.getId()) + ".json";
    const event = new MouseEvent("click", {
      bubbles: false,
      cancelable: false,
    });
    save_link.dispatchEvent(event);
  }, [config]);

  return html`
    <div>${isLoading && "loading"}</div>

    <button onclick=${downloadRequest}>Download request</button><br />

    Facade minimum distance
    <input
      type="number"
      defaultValue="${config.facadeDistance}"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeDistance: parseInt(e.target.value, 10),
        };

        setConfig(updated);

        localStorage.setItem(
          `dynamo-config-${Forma.getProjectId()}}`,
          JSON.stringify(updated)
        );
      }}
    />
    <br />

    Facade buffer
    <input
      type="number"
      defaultValue="${config.facadeBuffer}"
      onchange=${(e) => {
        const updated = {
          ...config,
          facadeBuffer: parseInt(e.target.value, 10),
        };

        setConfig(updated);

        localStorage.setItem(
          `dynamo-config-${Forma.getProjectId()}}`,
          JSON.stringify(updated)
        );
      }}
    />
    <br />

    <${RenderGeometries}
      geometry=${geometry}
      active=${active}
      onToggleActive=${onToggleActive}
    />
  `;
}

function App(props) {
  const [url, setUrl] = useState(localStorage.getItem("dynamo-url") || null);

  const onChange = useCallback((e) => {
    const { value } = e.target;
    localStorage.setItem("dynamo-url", value);
    setUrl(value);
  });

  return html`
    <div>
      <h1>Constraints</h1>

      <input defaultValue=${url} onchange=${onChange} />

      ${!url && "Set dynamo url to start"}
      ${url && html`<${DynamoRunner} url=${url} />`}
    </div>
  `;
}

render(html`<${App} />`, document.body);

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

async function bakeBody(config) {
  const rootUrn = await Forma.proposal.getRootUrn();

  const proposal = (
    await Promise.all(
      [
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })),
        ...(await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "generic",
        })),
      ]
        .filter((path) => path.split("/").length === 2)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));

  const surroundings = (
    await Promise.all(
      (
        await Forma.geometry.getPathsByCategory({
          urn: rootUrn,
          category: "building",
        })
      )
        .filter((path) => path.split("/").length === 3)
        .map((path) =>
          Forma.geometry.getTriangles({
            urn: rootUrn,
            path,
          })
        )
    )
  ).map((a) => Array.from(a));

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
      {
        nodeId: "57d3a29891014ef89bac997b62da4123",
        value: JSON.stringify(config || {}),
      },
      {
        nodeId: "57d3a29891014ef89bac997b62da4124",
        value: JSON.stringify(surroundings),
      },
    ],
  };
}

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

async function generateGeometry(entry) {
  const geometry = await new Promise((resolve) => {
    loader.load(
      "data:application/octet-stream;base64," + entry,
      async (gltf) => {
        resolve(gltf.scenes[0].children[0].geometry);
      }
    );
  });

  if (!geometry.getIndex()) {
    return null;
  }

  const positions = geometry.attributes.position.array;
  const index = [...geometry.getIndex().array];
  const position = filterPositions(positions);

  const nonIndexPositions = toNonIndexed(position, index);
  const color = Array(nonIndexPositions.length / 3)
    .fill([255, 0, 0, 255])
    .flat();

  return {
    position: nonIndexPositions,
    index,
    color: new Uint8Array(color),
  };
}

async function callDynamo(url, config) {
  try {
    const body = await bakeBody(config);

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const r = await response.json();

    return r.geometry;
  } catch (e) {
    console.error(e);
  }
}
