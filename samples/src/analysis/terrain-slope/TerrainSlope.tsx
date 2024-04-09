import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import FromTerrainBuffer from "./FromArrayBuffer.tsx";
import FromSavedPng from "./FromSavedPng.tsx";
import CalculateAndStore from "./Calculate.tsx";
import { getJSONObject, saveJSONObject } from "./storage.ts";

type Settings = {
  steepnessThreshold: number;
};

const DEFAULT_SETTINGS: Settings = {
  steepnessThreshold: 25,
};

export const SCALE = 1;

export const CANVAS_NAME = "terrain slope";

export default function TerrainSlope() {
  const [projectSettings, setProjectSettings] = useState<Settings>();
  console.log(projectSettings);
  useEffect(() => {
    getJSONObject("settings").then((res) => {
      if (!res) {
        setProjectSettings(DEFAULT_SETTINGS);
        return;
      }
      setProjectSettings(res.data as Settings);
    });
  }, []);

  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
  }, []);

  const saveSettings = useCallback(async () => {
    await saveJSONObject("settings", projectSettings as Settings);
  }, [projectSettings]);

  if (!projectSettings) {
    return <div>loading...</div>;
  }

  return (
    <>
      <div class="section">
        <p>Steepness Threshold</p>
        <weave-input
          type="number"
          value={projectSettings.steepnessThreshold}
          onChange={(e: CustomEvent<{ value: number; name: string }>) => {
            console.log(e.detail);
            setProjectSettings({
              ...projectSettings,
              steepnessThreshold: e.detail.value,
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
