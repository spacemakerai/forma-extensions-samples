import { Analysis } from "forma-embedded-view-sdk/analysis";
import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";

function createCanas(groundGrid) {
  const { grid, width, height } = groundGrid;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  for (let k = 0; k < groundGrid.length; k++) {
    const i = Math.floor(k % canvas.width);
    const j = Math.floor(k / canvas.width);

    if (!isNaN(grid[k])) {
      if (grid[k] < 55) {
        ctx.fillStyle = "green";
      } else if (grid[k] < 50) {
        ctx.fillStyle = "yello";
      } else {
        ctx.fillStyle = "red";
      }
      ctx.fillRect(i, j, 1, 1);
    }
  }
  return canvas;
}

export function App() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<
    Analysis | undefined
  >(undefined);

  useEffect(() => {
    Forma.analysis
      .list({ analysisTypes: ["noise"] })
      .then((analyses) => setAnalyses(analyses));
  }, []);

  const selectAnalysis = useCallback((e) => {
    const id = e.target.data["id"];

    const analysis = analyses.filter(({ analysisId }) => analysisId === id)[0];
    setSelectedAnalysis(analysis);
  }, []);

  const showAnalysis = useCallback(() => {
    (async function () {
      const groundResult = await Forma.analysis.getGroundGrid({
        analysis: selectedAnalysis,
      });

      const canvas = createCanas(groundResult);

      await Forma.terrain.groundTexture.add({
        name: "noise-results",
        canvas: canvas,
        position: {
          x: groundResult.x0 - groundResult.width / 2,
          y: groundResult.y0 - groundResult.height / 2,
          z: 29,
        },
        scale: groundResult.scale,
      });
    })();
  }, [selectedAnalysis]);

  return (
    <div>
      <select onChange={selectAnalysis}>
        {analyses.map((analysis: Analysis) => (
          <option data-id={analysis.analysisId} key={analysis.analysisId}>
            {analysis.analysisType}: {analysis.analysisType}
          </option>
        ))}
      </select>

      {selectAnalysis && (
        <div>
          <button onClick={showAnalysis}>Show results</button>
        </div>
      )}
    </div>
  );
}
