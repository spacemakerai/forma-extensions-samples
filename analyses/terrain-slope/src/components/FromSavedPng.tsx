import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import { CANVAS_NAME, SCALE } from "../app";
import { getCanvasObject } from "../services/storage";

type Props = {
  steepnessThreshold: number;
};

type MetadataPNG = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  steepnessThreshold: number;
};

export default function FromSavedPng({ steepnessThreshold }: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>();
  const [metadata, setMetadata] = useState<MetadataPNG>();
  useEffect(() => {
    getCanvasObject("terrain-steepness-png").then(async (res) => {
      if (!res) {
        return;
      }
      setCanvas(res.canvas);
      if (res.metadata) {
        setMetadata(res.metadata as MetadataPNG);
      }
    });
  }, []);

  const displayPng = useCallback(async () => {
    if (!metadata || !canvas) {
      return;
    }
    if (metadata.steepnessThreshold !== steepnessThreshold) {
      console.error("png's drawing doesn't match the provided steepness");
      return;
    }
    // need to find the reference point of the terrain to place the canvas
    // for this analysis, it's the middle of the terrain
    const position = {
      x: metadata.minX + (canvas.width * SCALE) / 2,
      y: metadata.maxY - (canvas.height * SCALE) / 2,
      z: 29, // need to put the texture higher up than original
    };

    await Forma.terrain.groundTexture.add({
      name: CANVAS_NAME,
      canvas,
      position,
      scale: { x: SCALE, y: SCALE },
    });
  }, [steepnessThreshold, metadata, canvas]);

  if (!metadata || !canvas) {
    return null;
  }
  return (
    <button onClick={displayPng} style="width: 100%">
      Draw slope from stored png
    </button>
  );
}
