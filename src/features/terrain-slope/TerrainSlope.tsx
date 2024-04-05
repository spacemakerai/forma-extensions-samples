import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import FromTerrainBuffer from "./FromArrayBuffer";
import FromSavedPng from "./FromSavedPng";
import CalculateAndStore from "./Calculate";
import { getJSONObject, saveJSONObject } from "./storage";

type Settings = {
  steepnessThreshold: number;
};

const DEFAULT_SETTINGS: Settings = {
  steepnessThreshold: 25,
};

export const SCALE = 1;

export const CANVAS_NAME = "terrain slope";

function TerrainSlope() {
  const [projectSettings, setProjectSettings] = useState<Settings>();
  console.log(projectSettings);
  useEffect(() => {
    getJSONObject("settings").then((res) => {
      if (!res) {
        setProjectSettings(DEFAULT_SETTINGS);
        return;
      }
      setProjectSettings(res.data);
    });
  }, []);

  if (!projectSettings) {
    return <div>loading...</div>;
  }

  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
  }, []);

  const saveSettings = useCallback(async () => {
    await saveJSONObject("settings", projectSettings);
  }, [projectSettings]);

  return (
    <>
      <h2>Terrain steepness</h2>
      <div class="section">
        <p>
          Calculate the terrain slope and check if a point is steeper than your
          threshold
        </p>
      </div>
      <div class="section">
        <p>Steepness Threshold</p>
        <weave-input
          type="number"
          value={projectSettings.steepnessThreshold}
          onChange={(e: CustomEvent) => {
            console.log(e.detail);
            setProjectSettings({
              ...projectSettings,
              steepnessThreshold: parseInt(e.detail.value),
            });
          }}
        />
      </div>
      <weave-button onClick={saveSettings}>Save settings</weave-button>
      <CalculateAndStore
        steepnessThreshold={projectSettings.steepnessThreshold}
      />
      <FromTerrainBuffer
        steepnessThreshold={projectSettings.steepnessThreshold}
      />
      <FromSavedPng steepnessThreshold={projectSettings.steepnessThreshold} />
      <weave-button onClick={removeTerrainSlope}>
        Remove terrain slope drawing
      </weave-button>
    </>
  );
}

export default function TerrainSlopeWrapper() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  return (
    <div className="example-item" style="width: 100%;">
      <div>
        <forma-expanded-tooltip
          position="bottom"
          target-id="terrain-slope"
          text="Terrain slope"
          loadingduration="100"
          help-url="https://github.com/spacemakerai/forma-extensions-samples"
        >
          <p>
            Calculate the slope of the terrain and draw a ground texture
            representing the steepness, where red is steeper than the threshold.
            This example uses the Storage API to store the results with a given
            setting to avoid recalculation.
          </p>
        </forma-expanded-tooltip>
        <weave-button
          id="terrain-slope"
          variant="solid"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Calculate terrain slope
        </weave-button>
      </div>
      {isExpanded && <TerrainSlope />}
    </div>
  );
}
