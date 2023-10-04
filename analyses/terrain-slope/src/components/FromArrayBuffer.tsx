import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import { createCanvasFromSlope, degreesToRadians } from "../utils";
import { RESOLUTION } from "../app";

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
    Forma.storage
      .getBinaryItem({
        key: "terrain-steepness-raw",
      })
      .then((res) => {
        if (!res) {
          return;
        }
        setTerrainSlope(new Float32Array(res.data));
        if (res.metadata) {
          setMetadata(JSON.parse(res.metadata));
        }
      });
  }, []);

  const calculateFromArrrayBuffer = useCallback(async () => {
    if (!metadata || !terrainSlope) return;

    const { width, height, maxSlope, minSlope, maxX, minX, minY, maxY } =
      metadata;
    const canvas = createCanvasFromSlope(
      terrainSlope,
      width,
      height,
      maxSlope,
      minSlope,
      degreesToRadians(steepnessThreshold)
    );

    const position = {
      x: ((maxX + minX) * RESOLUTION) / 2,
      y: ((maxY + minY) * RESOLUTION) / 2,
      z: 29,
    };
    await Forma.terrain.groundTexture.add({
      name: "terrain slope",
      canvas,
      position,
      scale: { x: 1, y: 1 },
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
