import { Forma } from "forma-embedded-view-sdk/auto";
import { useEffect, useState } from "preact/hooks";
import {
  WGS84CRS,
  createElementFromGlb,
  polygonToBbox,
  putInLibrary,
  transformGlbPositions,
  transformPolygon,
} from "./utils";
import {
  CityJSONLoader,
  CityJSONParser,
  CityObjectsMesh,
} from "cityjson-threejs-loader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export function GeoE3Buildings() {
  useEffect(() => {
    // Place logic that should run after the component has mounted here.
    // For example, you might want to fetch data or initialize some external library here.
    // If you want to replicate the behavior of your original script, you might want to call the 'order' function here.
  }, []);
  const [orderState, setOrderState] = useState("");

  const order = async () => {
    setOrderState("Select a polygon to order data");

    const selectedPolygon = await Forma.designTool.getPolygon();
    if (!selectedPolygon) {
      setOrderState("");
      return;
    }

    setOrderState("Processing order...");

    const { srid, refPoint, projString } = await Forma.project.get();
    const transformedPolygon = transformPolygon(
      selectedPolygon,
      refPoint,
      projString,
      WGS84CRS,
    );

    //This particular example buildings provider in Finland requres a bbox in this particular format.
    const bbox = polygonToBbox(transformedPolygon);
    const bbox_string = bbox.flat().join(",");
    fetch(
      `https://locationeurope.eu/geoe3/buildings3d/search?collections=buildings3d_FI&bbox=${bbox_string}&f=cityjson`,
    )
      .then((res) => res.json())
      .then((json: object) => {
        const parser = new CityJSONParser();
        const loader = new CityJSONLoader(parser);
        const exporter = new GLTFExporter();
        loader.load(json);
        const mesh = loader.scene.children[0] as CityObjectsMesh;

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

        const position = mesh.geometry.attributes.position.array;
        const oldRefPoint: [number, number] = [
          loader.matrix.elements[12],
          loader.matrix.elements[13],
        ];

        //Cityjson comes with coordinates expressed locally to a refPoint. We read it out through the matrix in the loader.
        transformGlbPositions(position, oldRefPoint, refPoint);

        // Flip to y-up
        let tmp: number;
        for (let i = 0; i < position.length; i += 3) {
          tmp = position[i + 1];
          position[i + 1] = position[i + 2];
          position[i + 2] = -tmp;
        }

        return new Promise<ArrayBuffer>((res, rej) => {
          exporter.parse(
            loader.scene,
            (glb) => {
              res(glb as ArrayBuffer);
            },
            (error: unknown) => {
              rej(error as Error);
            },
            {
              binary: true,
            },
          );
        });
      })
      .then((glb) => {
        return createElementFromGlb("DPE Buildings", glb, srid, refPoint);
      })
      .then((urn) => {
        putInLibrary(urn, "DPE Buildings");
        setOrderState("Order successful! Your buildings have been uploaded.");
      })
      .catch((e: unknown) => {
        console.error(e);
        setOrderState("Order failed. Please try again.");
      });
  };

  return (
    <div style="width: 100%;">
      <h3>GeoE3 buildings extension</h3>
      <div>{orderState}</div>
      <weave-button onClick={order} variant="outlined">
        Order
      </weave-button>
    </div>
  );
}
