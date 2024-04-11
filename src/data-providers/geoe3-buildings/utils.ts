import { Forma } from "forma-embedded-view-sdk/auto";
import { Vec3 } from "forma-embedded-view-sdk/design-tool";
import proj4 from "proj4";
import { TypedArray } from "three";

export const WGS84CRS = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

export function transformPolygon(
  polygon: Vec3[],
  refPoint: [number, number],
  oldProjectionString: string,
  newProjectionString: string,
) {
  const movedPolygon = polygon.map((p) => [
    p.x + refPoint[0],
    p.y + refPoint[1],
  ]);
  return movedPolygon.map((p) =>
    proj4(oldProjectionString, newProjectionString, p),
  );
}

export function polygonToBbox(polygon: number[][]) {
  const minX = Math.min(...polygon.map((p) => p[0]));
  const maxX = Math.max(...polygon.map((p) => p[0]));
  const minY = Math.min(...polygon.map((p) => p[1]));
  const maxY = Math.max(...polygon.map((p) => p[1]));

  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

export function transformGlbPositions(
  glbPositions: TypedArray,
  oldRefPoint: [number, number],
  newRefPoint: [number, number],
) {
  //This difference is the gap between the refPoint of the external dataset and the Forma refPoint.
  //Note that Z values are left as they were.
  const diffX = oldRefPoint[0] + newRefPoint[0];
  const diffY = oldRefPoint[1] + newRefPoint[1];
  const n = glbPositions.length / 3;
  for (let i = 0; i < n; i++) {
    glbPositions[i * 3] -= diffX;
    glbPositions[i * 3 + 1] -= diffY;
  }
}

export async function createElementFromGlb(
  name: string,
  glbContents: ArrayBuffer,
  srid: number,
  refPoint: [number, number],
) {
  const { fileId } = await Forma.integrateElements.uploadFile({
    authcontext: Forma.getProjectId(),
    data: glbContents,
  });

  const element = {
    id: "some-element-id",
    children: [],
    properties: {
      geometry: {
        type: "File",
        format: "glb",
        s3Id: fileId,
      },
    },
  };

  const scale = 1; // Model is assumed to be in meters
  const scalingElement = {
    id: "root",
    properties: {
      //This is where we tell Forma "where in the world is the data". If missing or wrong, it won't be placed correctly in the scene.
      geoReference: {
        srid,
        refPoint,
      },
      name,
    },
    children: [
      {
        id: element.id,
        transform: [
          [scale, 0, 0, 0],
          [0, scale, 0, 0],
          [0, 0, scale, 0],
          [0, 0, 0, 1],
        ].flat(),
      },
    ],
  };

  const { urn } = await Forma.integrateElements.createElementHierarchy({
    authcontext: Forma.getProjectId(),
    data: {
      rootElement: scalingElement.id,
      elements: { [scalingElement.id]: scalingElement, [element.id]: element },
    },
  });

  return urn;
}

export async function putInLibrary(urn: string, name: string) {
  await Forma.library.createItem({
    authcontext: Forma.getProjectId(),
    data: {
      name,
      urn,
      status: "success",
    },
  });
}
