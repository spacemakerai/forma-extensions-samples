import { Forma } from "forma-embedded-view-sdk/auto";

async function findMinOnTerrainZ(polygon: [number, number][]) {
  const zOffset = await Forma.terrain.elevationAt(...polygon[0])
  for (const i=1, i<polygon.length; i++) {
    const [x, y] = poylgon[i]
    const z = await Forma.terrain.elevationAt(x, y)
    zOffset = Math.min(z, zOffset)
  }
  return zOffset
}

function makeTranslateZMatrix(zOffset) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0, 
    0, 0, 1, 0, 
    0, 0, 0, 1
  ]
}

function async generateGeometry(polygon) {
  const { vertices, indices } = extrudePolygon(polygon);
  const zOffset = await findMinOnTerrainZ(polygon)
  const transform = makeTranslateZMatrix(zOffset)

  return { vertices, indices, transform }
}

export function App() {

  const { vertices, indices, transform } = generateGeometry([[0, 0],[0, 10],[10, 10], [10, 0]])

  const show = useCallback(()=> {
    Forma.render.addMesh({
      geometryData: {
        position: vertices,
        index: indices
      },
      transform: transform
    })
  }, [])

  const add = useCallback(() => {
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
                verts: vertices,
                faces: indices
              },
            },
          },
        },
      },
    });

    await Forma.proposal.addElement({urn, transform})
  }, [])

  return <div><button onClick={show}>Show</button><button onClick={add}>Add</button></div>;
}
