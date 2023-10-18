import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import { createCanvasFromSlope, degreesToRadians } from "../utils";
import { SCALE } from "../app";
import { getFloat32Array } from "../services/storage";

type Props = {
  steepnessThreshold: number;
};

type MetadataRaw = {
  maxSlope: number;
  minSlope: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

export default function FromTerrainBuffer({ steepnessThreshold }: Props) {
  const [terrainSlope, setTerrainSlope] = useState<Float32Array>();
  const [metadata, setMetadata] = useState<MetadataRaw>();
  useEffect(() => {
    getFloat32Array("terrain-steepness-raw").then((res) => {
      if (!res) {
        return;
      }
      setTerrainSlope(res.arr);
      if (res.metadata) {
        setMetadata(res.metadata as MetadataRaw);
      }
    });
  }, []);

  const calculateFromArrrayBuffer = useCallback(async () => {
    if (!metadata || !terrainSlope) return;

    const { width, height, maxSlope, minSlope, minX, maxY } = metadata;
    const canvas = createCanvasFromSlope(
      terrainSlope,
      width,
      height,
      maxSlope,
      minSlope,
      degreesToRadians(steepnessThreshold)
    );

    // need to find the reference point of the terrain to place the canvas
    // for this analysis, it's the middle of the terrain
    const position = {
      x: minX + (width * SCALE) / 2,
      y: maxY - (height * SCALE) / 2,
      z: 29,
    };
    await Forma.terrain.groundTexture.add({
      name: "terrain slope",
      canvas,
      position,
      scale: { x: SCALE, y: SCALE },
    });
  }, [steepnessThreshold, terrainSlope, metadata]);
  if (!metadata || !terrainSlope) {
    return null;
  }

  return (
    <button onClick={calculateFromArrrayBuffer} style="width: 100%">
      Draw slope from array stored buffer
    </button>
  );
}
