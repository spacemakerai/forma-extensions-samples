import { Analysis, AnalysisGroundGrid } from "forma-embedded-view-sdk/analysis";
import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";

function createCanas(groundGrid: AnalysisGroundGrid) {
  const { grid, width, height } = groundGrid;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  for (let k = 0; k < grid.length; k++) {
    const i = Math.floor(k % canvas.width);
    const j = Math.floor(k / canvas.width);

    if (!isNaN(grid[k])) {
      if (grid[k] < 50) {
        ctx.fillStyle = "green";
      } else if (grid[k] < 55) {
        ctx.fillStyle = "yellow";
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
    Forma.analysis.list({ analysisTypes: ["noise"] }).then((analyses) => {
      setAnalyses(analyses);
      if (analyses.length) {
        setSelectedAnalysis(analyses[0]);
      }
    });
  }, []);

  useEffect(() => {
    console.log(selectedAnalysis);
  }, [selectedAnalysis]);

  const selectAnalysis = useCallback((e) => {
    const id = e.target.data["id"];

    const analysis = analyses.filter(({ analysisId }) => analysisId === id)[0];
    setSelectedAnalysis(analysis);
  }, []);

  const showAnalysis = useCallback(() => {
    (async function () {
      try {
        const groundResult = await Forma.analysis.getGroundGrid({
          analysis: selectedAnalysis,
        });

        const canvas = createCanas(groundResult);

        const position = {
          x: groundResult.x0 + (groundResult.width * groundResult.scale.x) / 2,
          y: groundResult.y0 - (groundResult.height * groundResult.scale.y) / 2,
          z: 29,
        };

        await Forma.terrain.groundTexture.add({
          name: "noise-results",
          canvas: canvas,
          position,
          scale: groundResult.scale,
        });

        console.log("drawn");
      } catch (e) {
        console.error(e);
      }
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
      <div>
        <button
          onClick={() =>
            Forma.terrain.groundTexture.remove({ name: "noise-results" })
          }
        >
          Remove result
        </button>
      </div>
    </div>
  );
}
