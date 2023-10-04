import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import FromTerrainBuffer from "./components/FromArrayBuffer";
import FromSavedPng from "./components/FromSavedPng";
import CalculateAndStore from "./components/Calculate";

type Settings = {
  steepnessThreshold: number;
};

const DEFAULT_SETTINGS: Settings = {
  steepnessThreshold: 25,
};

export const RESOLUTION = 1;

export const CANVAS_NAME = "terrain slope";
// function calculateTerrainSteepness();

export default function App() {
  const [projectSettings, setProjectSettings] = useState<Settings>();

  useEffect(() => {
    Forma.storage.getTextItem({ key: "settings" }).then((res) => {
      if (!res) {
        setProjectSettings(DEFAULT_SETTINGS);
        return;
      }
      setProjectSettings(JSON.parse(res.data) as Settings);
    });
  }, []);

  if (!projectSettings) {
    return <div>loading...</div>;
  }

  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
  }, []);

  const saveSettings = useCallback(async () => {
    await Forma.storage.setItem({
      key: "settings",
      data: JSON.stringify(projectSettings),
    });
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
        <input
          type="number"
          value={projectSettings.steepnessThreshold}
          onChange={(e) =>
            setProjectSettings({
              ...projectSettings,
              steepnessThreshold: parseInt(e.currentTarget.value),
            })
          }
        />
      </div>
      <button onClick={saveSettings} style="width: 100%">
        Save settings
      </button>
      <CalculateAndStore
        steepnessThreshold={projectSettings.steepnessThreshold}
      />
      <FromTerrainBuffer
        steepnessThreshold={projectSettings.steepnessThreshold}
      />
      <FromSavedPng steepnessThreshold={projectSettings.steepnessThreshold} />
      <button onClick={removeTerrainSlope} style="width: 100%">
        Remove terrain slope drawing
      </button>
    </>
  );
}
