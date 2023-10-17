import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import { CANVAS_NAME, SCALE } from "../app";

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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

async function canvasFromDataUrl(url: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2d context from canvas");
  }
  return await loadImage(url)
    .then((image) => {
      canvas.height = image.height;
      canvas.width = image.width;
      ctx.drawImage(image, 0, 0);
      return canvas;
    })
    .catch((err) => {
      console.error("failed to load canvas from url", err);
    });
}

export default function FromSavedPng({ steepnessThreshold }: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>();
  const [metadata, setMetadata] = useState<MetadataPNG>();
  useEffect(() => {
    Forma.extensions.storage
      .getTextObject({
        key: "terrain-steepness-png",
      })
      .then(async (res) => {
        if (!res) {
          return;
        }
        const storedCanvas = await canvasFromDataUrl(res.data);
        if (!storedCanvas) {
          return;
        }
        setCanvas(storedCanvas);
        if (res.metadata) {
          setMetadata(JSON.parse(res.metadata));
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
