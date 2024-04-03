import { CityJSONLoader, CityJSONParser } from "cityjson-threejs-loader";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { Forma } from "forma-embedded-view-sdk/auto";
import proj4 from "proj4";

const parser = new CityJSONParser();
const loader = new CityJSONLoader(parser);
const exporter = new GLTFExporter();

export async function createElementFromGlb(name, elements, srid, refPoint) {
  const scale = 1; // Model is assumed to be in meters
  const scalingElement = {
    id: "root",
    properties: {
      //This is where we tell Forma "where in the world is the data". If missing or wrong, it won't be placed correctly in the scene.
      geoReference: {
        srid: srid,
        refPoint: refPoint,
      },
      name,
    },
    children: elements.map((element) => ({
      id: element.id,
      transform: [
        [scale, 0, 0, 0],
        [0, scale, 0, 0],
        [0, 0, scale, 0],
        [0, 0, 0, 1],
      ].flat(),
    })),
  };

  const elementsMap = elements.reduce(
    (obj, element) => ({
      ...obj,
      [element.id]: element,
    }),
    {}
  );

  const { urn } = await Forma.integrateElements.createElementHierarchy({
    authcontext: Forma.getProjectId(),
    data: {
      rootElement: scalingElement.id,
      elements: { [scalingElement.id]: scalingElement, ...elementsMap },
    },
  });

  return urn;
}

export async function putInLibrary(urn, name) {
  await Forma.library.createItem({
    authcontext: Forma.getProjectId(),
    data: {
      name,
      urn,
      status: "success",
    },
  });
}

function transformPolygon(
  polygon,
  refPoint,
  oldProjectionString,
  newProjectionString
) {
  const movedPolygon = polygon.map((p) => [
    p.x + refPoint[0],
    p.y + refPoint[1],
  ]);
  return movedPolygon.map((p) =>
    proj4(oldProjectionString, newProjectionString, p)
  );
}

//standard lat lon coordinate system
const WGS84CRS = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

function polygonToBbox(polygon) {
  const minX = Math.min(...polygon.map((p) => p[0]));
  const maxX = Math.max(...polygon.map((p) => p[0]));
  const minY = Math.min(...polygon.map((p) => p[1]));
  const maxY = Math.max(...polygon.map((p) => p[1]));

  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

function transformGlbPositions(glbPositions, oldRefPoint, newRefPoint) {
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

async function order() {
  //Trigger polygon selection for the user, the ordering process continues when a polygon is selected.

  const selectedPolygon = await Forma.designTool.getPolygon();

  const { srid, refPoint, projString } = await Forma.project.get();

  //We have a polygon expressed in local coordinates. We need to 1: Add the refpoint to place it in the world, and 2: convert it to lat lon
  const transformedPolygon = transformPolygon(
    selectedPolygon,
    refPoint,
    projString,
    WGS84CRS
  );

  //This particular example buildings provider in Finland requres a bbox in this particular format.
  const bbox = polygonToBbox(transformedPolygon);
  const bbox_string = bbox.flat().join(",");

  fetch(
    `https://geoe3platform.eu/geoe3/buildings3d/search?collections=buildings3d_FI&bbox=${bbox_string}&f=cityjson`
  )
    .then((res) => res.json())
    .then((json) => {
      const originalCityObjects = json.CityObjects;
      console.log(json);
      const promises = [];

      for (const [id, cityObject] of Object.entries(originalCityObjects)) {
        // Create a new CityJSON object for this CityObject
        const newCityJson = {
          ...json,
          CityObjects: {
            [id]: cityObject, // This new CityJSON only contains this CityObject
          },
        };
        loader.load(newCityJson);
        console.log(newCityJson, loader);

        const mesh = loader.scene.children[0];

        // Debug by rendering directly into designmode scene
        // setGeometryColor(new Color(0xfc6603), mesh.geometry, 0.5);
        // Forma.render.addMesh({
        //   geometryData: {
        //     position: new Float32Array(
        //       mesh.geometry.getAttribute("position").array
        //     ),
        //     normal: new Float32Array(mesh.geometry.getAttribute("normal").array),
        //     color: new Uint8Array(mesh.geometry.getAttribute("color").array),
        //   },
        //   transform: new Matrix4().toArray(),
        // });

        // The GLTFExporter creates non-compliant GLBs when these are present
        // Specifically, it creates accessors with componenttypes that are not spec-compliant, as these are signed integer arrays.
        // Could probably map these into attributes/TypedArrays that would work, but they are not needed for the base geometry,
        // so easier just to remove them for this example.
        delete mesh.geometry.attributes.surfacetype;
        delete mesh.geometry.attributes.type;
        delete mesh.geometry.attributes.lodid;
        delete mesh.geometry.attributes.boundaryid;
        delete mesh.geometry.attributes.geometryid;
        delete mesh.geometry.attributes.objectid;
        // The GLTFExporter creates an InterleavedBuffer when both normal and position attributes are set.
        // As of now, the merging code in designmode only supports non-interleaved attributes.
        delete mesh.geometry.attributes.normal;
        delete mesh.geometry.attributes._OBJECTID;
        delete mesh.geometry.attributes._LODID;
        console.log(mesh.geometry.attributes);

        const position = mesh.geometry.attributes.position.array;
        const oldRefPoint = [
          loader.matrix.elements[12],
          loader.matrix.elements[13],
        ];

        //Cityjson comes with coordinates expressed locally to a refPoint. We read it out through the matrix in the loader.
        transformGlbPositions(position, oldRefPoint, refPoint);

        // Flip to y-up
        let tmp;
        for (let i = 0; i < position.length; i += 3) {
          tmp = position[i + 1];
          position[i + 1] = position[i + 2];
          position[i + 2] = -tmp;
        }

        promises.push(
          new Promise((res, rej) => {
            exporter.parse(
              loader.scene,
              (glb) => {
                const blob = new Blob([glb], {
                  type: "application/octet-stream",
                });
                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `${id}.glb`;
                link.click();

                // Remember to revoke the object URL to free memory
                URL.revokeObjectURL(url);
                res({ id, glb });
              },
              (error) => {
                rej(error);
              },
              {
                binary: true,
              }
            );
          })
        );
      }

      return Promise.all(promises);
    })
    .then((results) => {
      const elementPromises = results.map(async ({ id, glb }) => {
        console.log(glb);
        const { fileId } = await Forma.integrateElements.uploadFile({
          authcontext: Forma.getProjectId(),
          data: glb,
        });
        return {
          id,
          children: [],
          properties: {
            geometry: {
              type: "File",
              format: "glb",
              s3Id: fileId,
            },
          },
        };
      });

      return Promise.all(elementPromises);
    })
    .then((elements) => {
      // Now elements is guaranteed to be an array of all elements
      return createElementFromGlb(
        `DPE Buildings ${elements[0].id}`,
        elements,
        srid,
        refPoint
      )
        .then((urn) => {
          putInLibrary(urn, `DPE Buildings ${elements[0].id}`);
          const orderState = document.getElementById("orderState");
          orderState.innerText =
            "Order successful, go to library to place the buildings";
        })
        .catch((e) => console.error(e));
    });
}

document.getElementById("orderButton").onclick = order;
