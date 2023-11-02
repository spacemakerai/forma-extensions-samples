import { Forma } from "forma-embedded-view-sdk/auto";
import { extrudePolygon } from "geometry-extrude";
import { useCallback } from "preact/hooks";

function findMinOnTerrainZ(polygon: [number, number][]) {
  return 20;

  /*let zOffset = await Forma.terrain.elevationAt(...polygon[0]);
  for (let i = 1; i < polygon.length; i++) {
    const [x, y] = polygon[i];
    const z = await Forma.terrain.elevationAt(x, y);
    zOffset = Math.min(z, zOffset);
  }
  return zOffset;*/
}

function makeTranslateZMatrix(
  zOffset
): [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

async function generateGeometry(polygon) {
  const { position, indices } = extrudePolygon([polygon], { depth: 10 });
  const zOffset = findMinOnTerrainZ(polygon);
  const transform = makeTranslateZMatrix(zOffset);

  return { position, indices, transform };
}

const { position, indices, transform } = await generateGeometry([
  [
    [0, 0],
    [0, 10],
    [10, 10],
    [10, 0],
  ],
]);

export function App() {
  const show = useCallback(() => {
    Forma.render.addMesh({
      geometryData: {
        position,
      },
      transform: transform,
    });
  }, []);

  const add = useCallback(async () => {
    const { urn } = await Forma.integrateElements.createElementHierarchy({
      authcontext: Forma.getProjectId(),
      data: {
        rootElement: "root",
        elements: {
          root: {
            id: "root",
            properties: {
              name: "My custom element",
              category: "building",
              geometry: {
                type: "Inline",
                format: "Mesh",
                verts: [...position],
                faces: [...indices],
              },
            },
          },
        },
      },
    });

    await Forma.proposal.addElement({ urn, transform });
  }, []);

  return (
    <div>
      <button onClick={show}>Show</button>
      <button onClick={add}>Add</button>
    </div>
  );
}
