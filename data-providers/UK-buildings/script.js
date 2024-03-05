import { Forma } from "https://esm.sh/forma-embedded-view-sdk/auto";


export async function processAndRenderProjectGeojson(apiKey) {
    try {
        // Fetch the BBox of the terrain
        const projectDetails = await Forma.project.get()
        console.log("projectDetails", projectDetails)
        const bbox = await Forma.terrain.getBbox();
        const adjustbboxArray = adjustBBoxWithRefPoint(bbox, projectDetails.refPoint);
        const bboxWGS84 = convertBBoxToWGS84(adjustbboxArray, projectDetails.projString);
        const osBuildinggeojson = await fetchGeoJSONFromBBoxWithPagination(bboxWGS84, apiKey);
        console.log("osBuildinggeojson", JSON.parse(JSON.stringify(osBuildinggeojson)))
        const featureCollection = {
            type: "FeatureCollection",
            features: osBuildinggeojson
        }
        const geojson = recenterGeoJSON(featureCollection, projectDetails.refPoint, 'EPSG:4326', projectDetails.projString)

        console.log("geojson2", JSON.parse(JSON.stringify(geojson)))
        const geoJsonWithHeightAndElevation = {
            ...geojson,
            features: geojson.features.map((feature) => ({
                ...feature,
                properties: {
                    //...feature.properties,
                    height: feature.properties.relativeheightmaximum,
                    elevation: feature.properties.absoluteheightminimum,
                    elevation_definition: "MASL"
                }
            }))
        }
        const res = await Forma.experimental.geodata.normalizeVectorData(
            {
                data: geoJsonWithHeightAndElevation,
                dataType: "buildings"
            }
        )

        const item = await Forma.library.createItem({
            data: { name: "OS Buildings", status: "success", urn: res.urn }
        })
        console.log("done")
    } catch (error) {
        console.error("Failed to process and render project GeoJSON:", error);
        throw error;
    }
}


function convertBBoxToWGS84(bbox, projString) {
    // Convert each point of the BBox
    const sw = proj4(projString, 'EPSG:4326', [bbox[0], bbox[1]]);
    const ne = proj4(projString, 'EPSG:4326', [bbox[2], bbox[3]]);
    return [sw[0], sw[1], ne[0], ne[1]];
}

function adjustBBoxWithRefPoint(bbox, refPoint, projString) {
    // Assuming bbox is in the project's local UTM coordinates, adjust by refPoint
    const adjustedMinX = bbox.min.x + refPoint[0];
    const adjustedMinY = bbox.min.y + refPoint[1];
    const adjustedMaxX = bbox.max.x + refPoint[0];
    const adjustedMaxY = bbox.max.y + refPoint[1];

    return [adjustedMinX, adjustedMinY, adjustedMaxX, adjustedMaxY];
}

// Utility function to fetch data from the ArcGIS FeatureServer
async function fetchGeoJSONFromBBoxWithPagination(bbox, apiKey) {
    // Destructure the bbox array into individual components for clarity
    const [southWestLongitude, southWestLatitude, northEastLongitude, northEastLatitude] = bbox;

    // Initialize variables for pagination
    let buildings = [];
    const MAX_ITER = 200;
    let iter = 0;
    let next_page = `https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items?bbox=${southWestLongitude},${southWestLatitude},${northEastLongitude},${northEastLatitude}`;

    while (iter < MAX_ITER && next_page) {
        try {
            // Fetch the data from the API or the next page
            const response = await fetch(next_page, {
                headers: {
                    'Accept': 'application/geo+json',
                    'key': apiKey
                }
            });

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`API call failed with HTTP status ${response.status}`);
            }

            // Parse the response body as JSON
            const json = await response.json();

            // Accumulate buildings data
            buildings = buildings.concat(json["features"]);

            // Attempt to find the next page from the response links
            next_page = json["links"] && json["links"].find(link => link["rel"] === "next") ? json["links"].find(link => link["rel"] === "next")["href"] : null;
            await sleep(1000);
            iter++;
        } catch (error) {
            console.error('Failed to fetch GeoJSON data:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

    return buildings;
}


function recenterGeoJSON(inputGeoJSON, refPoint, sourceSRID, targetSRID) {
    // Ensure reference point is in the correct format and CRS
    const adjustAndReprojectCoordinates = (coords) => {
        // First, project input coords to targetSRID
        let projectedCoords = proj4(sourceSRID, targetSRID, coords);
        return projectedCoords
    };

    // Apply the transformation to every point in the GeoJSON
    turf.coordEach(inputGeoJSON, (currentCoord) => {
        const transformedCoord = adjustAndReprojectCoordinates(currentCoord);
        currentCoord[0] = transformedCoord[0];
        currentCoord[1] = transformedCoord[1];
    });

    return inputGeoJSON;
}


const sleep = ms => new Promise(r => setTimeout(r, ms));