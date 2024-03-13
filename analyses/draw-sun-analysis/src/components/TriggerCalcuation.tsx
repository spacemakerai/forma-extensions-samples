import { Analysis } from "forma-embedded-view-sdk/analysis";
import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useState } from "preact/hooks";
import { createSunlitPointsMask } from "./utils";

type Props = {
  selectedAnalysis: Analysis | undefined;
  hour: number;
  minute: number;
};

function fillImageFromSunlitMask(canvas: HTMLCanvasElement, mask: Float32Array) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  for (let k = 0; k < mask.length; k++) {
    const i = Math.floor(k % canvas.width);
    const j = Math.floor(k / canvas.width);
    if (!isNaN(mask[k])) {
      if (mask[k] === 0) {
        ctx.fillStyle = "red";
      } else {
        ctx.fillStyle = "green";
      }
      ctx.fillRect(i, j, 1, 1);
    }
  }
  return canvas;
}

export default function TriggerCalculation({ selectedAnalysis, hour, minute }: Props) {
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const calculate = useCallback(async () => {
    setIsCalculating(true);
    await Forma.terrain.groundTexture.remove({ name: "sunlit points" });
    if (!selectedAnalysis) {
      return;
    }
    const groundGrid = await Forma.analysis.getGroundGrid({
      analysis: selectedAnalysis,
    });
    const canvas = document.createElement("canvas");
    canvas.width = groundGrid.width;
    canvas.height = groundGrid.height;
    if (!groundGrid.mask) {
      console.error("there is no mask for analysis");
      return;
    }
    const sunlitPointsMask = createSunlitPointsMask(groundGrid.mask, groundGrid.grid, hour, minute);
    fillImageFromSunlitMask(canvas, sunlitPointsMask);

    const position = {
      x: groundGrid.x0 + (groundGrid.width * groundGrid.scale.x) / 2,
      y: groundGrid.y0 - (groundGrid.height * groundGrid.scale.y) / 2,
      z: 29,
    };
    await Forma.terrain.groundTexture.add({
      name: "sunlit points",
      canvas: canvas,
      position,
      scale: groundGrid.scale,
    });
    setIsCalculating(false);
  }, [selectedAnalysis, hour, minute]);

  const text = (() => {
    if (!selectedAnalysis) return "Select an analysis";
    if (!isCalculating) return "Calculating";
    else return "Calculate sunlit points";
  })();
  return (
    <div class="section" id="testing">
      <button class="calculate" onClick={calculate} disabled={!selectedAnalysis || isCalculating}>
        {text}
      </button>
    </div>
  );
}
