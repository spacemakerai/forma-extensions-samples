import { Forma } from "forma-embedded-view-sdk/auto";
import { Bbox } from "forma-embedded-view-sdk/terrain";
import proj4 from "proj4";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { coordEach } from "@turf/meta";

export async function processAndRenderProjectGeojson(apiKey: string) {
  try {
    // Fetch the BBox of the terrain
    const projectDetails = await Forma.project.get();
    console.log("projectDetails", projectDetails);
    const bbox = await Forma.terrain.getBbox();
    const adjustbboxArray = adjustBBoxWithRefPoint(
      bbox,
      projectDetails.refPoint,
    );
    const bboxWGS84 = convertBBoxToWGS84(
      adjustbboxArray,
      projectDetails.projString,
    );
    const osBuildinggeojson = await fetchGeoJSONFromBBoxWithPagination(
      bboxWGS84,
      apiKey,
    );
    console.log(
      "osBuildinggeojson",
      JSON.parse(JSON.stringify(osBuildinggeojson)),
    );
    const featureCollection: GeoJSON.FeatureCollection<
      GeoJSON.Geometry,
      Properties
    > = {
      type: "FeatureCollection",
      features: osBuildinggeojson,
    };

    const geojson = recenterGeoJSON(
      featureCollection,
      "EPSG:4326",
      projectDetails.projString,
    );

    console.log("geojson2", JSON.parse(JSON.stringify(geojson)));
    const geoJsonWithHeightAndElevation = {
      ...geojson,
      features: geojson.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          height: feature.properties?.relativeheightmaximum ?? "",
          elevation: feature.properties?.absoluteheightminimum ?? "",
          elevation_definition: "MASL",
        },
      })),
    };
    const res = await Forma.experimental.geodata.normalizeVectorData({
      data: geoJsonWithHeightAndElevation,
      dataType: "buildings",
    });

    if (res) {
      await Forma.library.createItem({
        data: { name: "OS Buildings", status: "success", urn: res.urn },
      });
      console.log("done");
    }
  } catch (error) {
    console.error("Failed to process and render project GeoJSON:", error);
    throw error;
  }
}

function convertBBoxToWGS84(
  bbox: [number, number, number, number],
  projString: string,
): [number, number, number, number] {
  // Convert each point of the BBox
  const sw = proj4(projString, "EPSG:4326", [bbox[0], bbox[1]]);
  const ne = proj4(projString, "EPSG:4326", [bbox[2], bbox[3]]);
  return [sw[0], sw[1], ne[0], ne[1]];
}

function adjustBBoxWithRefPoint(
  bbox: Bbox,
  refPoint: [number, number],
): [number, number, number, number] {
  // Assuming bbox is in the project's local UTM coordinates, adjust by refPoint
  const adjustedMinX = bbox.min.x + refPoint[0];
  const adjustedMinY = bbox.min.y + refPoint[1];
  const adjustedMaxX = bbox.max.x + refPoint[0];
  const adjustedMaxY = bbox.max.y + refPoint[1];

  return [adjustedMinX, adjustedMinY, adjustedMaxX, adjustedMaxY];
}

type Properties = {
  relativeheightmaximum?: number;
  absoluteheightminimum?: number;
};

// Utility function to fetch data from the ArcGIS FeatureServer
async function fetchGeoJSONFromBBoxWithPagination(
  bbox: [number, number, number, number],
  apiKey: string,
) {
  // Destructure the bbox array into individual components for clarity
  const [
    southWestLongitude,
    southWestLatitude,
    northEastLongitude,
    northEastLatitude,
  ] = bbox;

  // Initialize variables for pagination
  let buildings: GeoJSON.Feature<GeoJSON.Geometry, Properties>[] = [];
  const MAX_ITER = 200;
  let iter = 0;
  let next_page: string | undefined =
    `https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items?bbox=${southWestLongitude},${southWestLatitude},${northEastLongitude},${northEastLatitude}`;

  while (iter < MAX_ITER && next_page) {
    try {
      // Fetch the data from the API or the next page
      const response = await fetch(next_page, {
        headers: {
          Accept: "application/geo+json",
          key: apiKey,
        },
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`API call failed with HTTP status ${response.status}`);
      }

      // Parse the response body as JSON
      const json = (await response.json()) as {
        features: GeoJSON.Feature<GeoJSON.Geometry, Properties>[];
        links: { rel: string; href: string }[];
      };

      // Accumulate buildings data
      buildings = buildings.concat(json.features);

      // Attempt to find the next page from the response links
      next_page = json.links?.find((link) => link.rel === "next")?.href;

      // sleep for 1 second to avoid rate limiting
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      iter++;
    } catch (error) {
      console.error("Failed to fetch GeoJSON data:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  return buildings;
}

function recenterGeoJSON(
  inputGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Geometry, Properties>,
  sourceSRID: string,
  targetSRID: string,
) {
  // Ensure reference point is in the correct format and CRS
  const adjustAndReprojectCoordinates = (coords: number[]) => {
    // First, project input coords to targetSRID
    const projectedCoords = proj4(sourceSRID, targetSRID, coords);
    return projectedCoords;
  };

  // Apply the transformation to every point in the GeoJSON
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  coordEach(inputGeoJSON, (currentCoord: number[]) => {
    const transformedCoord = adjustAndReprojectCoordinates(currentCoord);
    currentCoord[0] = transformedCoord[0];
    currentCoord[1] = transformedCoord[1];
  });

  return inputGeoJSON;
}

export default function UKBuildings() {
  return (
    <div style="display: flex; flex-direction: column; align-items: center; font-size: 1.2em;">
      <h1>UK Buildings data</h1>
      <br />
      <h2>
        This Extension uses your API Key from{" "}
        <a href="https://osdatahub.os.uk/">https://osdatahub.os.uk/</a>{" "}
      </h2>
      <h2>Fetched data will be stored in the Library</h2>
      <br />
      <h3>Please follow the Instructions below to get started</h3>
      <p>
        To use this data processor, you need an API key from OS Data Hub. Follow
        these steps to obtain your API key:
      </p>
      <ol>
        <li>
          Go to the OS Data Hub website:{" "}
          <a href="https://osdatahub.os.uk/">https://osdatahub.os.uk/</a>.
        </li>
        <li>
          If you don't have an account, sign up by clicking the "Sign Up" button
          and following the registration process.
        </li>
        <li>
          Once logged in, navigate to the section where you can create a new
          project.
        </li>
        <li>
          Select the "OS NGD API – Features" or a similarly named option when
          choosing the API products for your project.
        </li>
        <li>
          Fill in the details for your project, such as naming your project and
          providing a brief description.
        </li>
        <li>
          After creating your project with the selected API, the platform will
          generate an API key for you.
        </li>
        <li>
          Copy the API key to a secure location. You will need this key to use
          the data processor.
        </li>
      </ol>
      <div
        id="inputArea"
        style="display: flex; justify-content: center; gap: 10px;"
      >
        <label for="apiKey" style="align-self: center;">
          Enter API Key:
        </label>
        <weave-input
          type="text"
          id="apiKey"
          name="apiKey"
          style="font-size: 1.2em;"
        />
        <weave-button id="processButton">Process Data</weave-button>
      </div>

      <div id="status">
        <p id="statusMessage">Enter an API key to begin.</p>
      </div>
    </div>
  );
}
