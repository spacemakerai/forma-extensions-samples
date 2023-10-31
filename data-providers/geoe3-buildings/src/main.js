import {CityJSONLoader, CityJSONParser} from "cityjson-threejs-loader";
import {GLTFExporter} from "three/addons/exporters/GLTFExporter.js";
import {Forma} from "forma-embedded-view-sdk/auto";
import proj4 from "proj4";

const parser = new CityJSONParser();
const loader = new CityJSONLoader(parser);
const exporter = new GLTFExporter();


export async function createElementFromGlb(name, glbContents, srid, refPoint) {
    const {fileId} = await Forma.integrateElements.uploadFile({
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
                srid: srid,
                refPoint: refPoint,
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

    const {urn} = await Forma.integrateElements.createElementHierarchy({
        authcontext: Forma.getProjectId(),
        data: {
            rootElement: scalingElement.id,
            elements: {[scalingElement.id]: scalingElement, [element.id]: element},
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


function transformPolygon(polygon, refPoint, oldProjectionString, newProjectionString) {
    const movedPolygon = polygon.map(p => [p[0] + refPoint[0], p[1] + refPoint[1]])
    return movedPolygon.map(p => proj4(oldProjectionString, newProjectionString, p))
}

//standard lat lon coordinate system
const WGS84CRS = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"


function polygonToBbox(polygon) {
    const minX = Math.min(...polygon.map(p => p[0]))
    const maxX = Math.max(...polygon.map(p => p[0]))
    const minY = Math.min(...polygon.map(p => p[1]))
    const maxY = Math.max(...polygon.map(p => p[1]))

    return [
        [minX, minY],
        [maxX, maxY],
    ]
}


function transformGlbPositions(glbPositions, oldRefPoint, newRefPoint) {
    //This difference is the gap between the refPoint of the external dataset and the Forma refPoint.
    //Note that Z values are left as they were.
    const diffX = oldRefPoint[0] + newRefPoint[0]
    const diffY = oldRefPoint[1] + newRefPoint[1]
    const n = glbPositions.length / 3
    for (let i = 0; i < n; i++) {
        glbPositions[i * 3] -= diffX
        glbPositions[i * 3 + 1] -= diffY
    }
}

async function order() {

    //Capture the ID of whatever is selected. This code has no logic or error handling, so make sure
    //when testing to click on a 2D polygon on the ground in the scene for this to work.
    const [selectionId] = await Forma.selection.getSelection()

    //Once we have the ID, we can get the actual geometry of the selected object.
    const footPrint = await Forma.geometry.getFootprint({path: selectionId})

    const {srid, refPoint, projString} = await Forma.project.get()

    //We have a polygon expressed in local coordinates. We need to 1: Add the refpoint to place it in the world, and 2: convert it to lat lon
    const transformedFootPrint = transformPolygon(footPrint.coordinates, refPoint, projString, WGS84CRS)

    //This particular example buildings provider in Finland requres a bbox in this particular format.
    const bbox = polygonToBbox(transformedFootPrint)
    const bbox_string = bbox.flat().join(",");

    fetch(
        `https://geoe3platform.eu/geoe3/buildings3d/search?collections=buildings3d_FI&bbox=${bbox_string}&f=cityjson`
    )
        .then((res) => res.json())
        .then((json) => {
            loader.load(json);
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

            const position = mesh.geometry.attributes.position.array;
            const oldRefPoint = [loader.matrix.elements[12], loader.matrix.elements[13]]

            //Cityjson comes with coordinates expressed locally to a refPoint. We read it out through the matrix in the loader.
            transformGlbPositions(position, oldRefPoint, refPoint)

            // Flip to y-up
            let tmp;
            for (let i = 0; i < position.length; i += 3) {
                tmp = position[i + 1];
                position[i + 1] = position[i + 2];
                position[i + 2] = -tmp;
            }


            return new Promise((res, rej) => {
                exporter.parse(
                    loader.scene,
                    (glb) => {
                        res(glb);
                    },
                    (error) => {
                        rej(error);
                    },
                    {
                        binary: true,
                    }
                );
            });
        })
        .then((glb) => {
            return createElementFromGlb("DPE Buildings", glb, srid, refPoint);
        })
        .then((urn) => {
            putInLibrary(urn, "DPE Buildings");
            const orderState = document.getElementById("orderState")
            orderState.innerText = "Order successful"
        })
        .catch((e) => console.error(e));
}

document.getElementById("orderButton").onclick = order;
