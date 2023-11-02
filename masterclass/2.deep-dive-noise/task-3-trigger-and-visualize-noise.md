# Trigger and visualize noise results

In this example we will show you how you can trigger an analysis. Wait for the results, and visualize them in the 3d scene.

...Insert end goal picture here...

APIs: `SelectionAPI`, `AnalysisAPI`, `TerrainAPI`

## Getting set up

Copy the `task-template` folder and name it `task-3`.

## Create a trigger button

Create a button in your `html` called with the name `trigger`. Add an `onclick` event to the trigger button.
In this trigger button we need to first get the `selection` in the scene.
With this selection we need to call `Forma.analysis.triggerNoise`.
This method takes the given selected elemets and runs a `noise` analysis on them.

Note: We currently only support reading ground scores, so make sure you select a ground surface like the the `site_limit`.

## Polling for results

Now that the analysis is running we will need to wait for the response.
You will need to poll the `Forma.analysis.list` method to get this status.
Let us make a drop down list of all of the available analyses.
We need to add a `select` drop down with an `option` for each analysis.

In React/preact you would do something like this given the list:

```js
function AnalysisPicker({ setAnalysis }) {
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    (async () => {
      setAnalyses(await Forma.analysis.list());
    })();
  }, []);

  return (
    <select>
      {analyses.map((analysis) => (
        <option>{analysis.analysisId}</option>
      ))}
    </select>
  );
}
```

## Inspecting the results

Once you have selected an analysis, then you can read the analysis results with `Forma.analysis.getGroundGrid(analysis)`.

You can read more about these results [here](https://aps.autodesk.com/en/docs/forma/v1/embedded-views/useful-concepts/analysis/noise/), the noise analysis in general [here](https://help.autodeskforma.com/en/articles/7793576-detailed-noise-analysis-beta) or output type [here](https://app.autodeskforma.com/forma-embedded-view-sdk/docs/types/analysis.AnalysisGroundGrid.html).

## Rendering the results to the scene

These results can be rendered to the scene by drawing to the terrain texture.
You can use `Forma.terrain.groundTexture.add` to draw to the texture. This method
takes a HTMLCanvasElement as input, in addition to position and scale.

To draw the `noise` analysis results to a ground texture we need to choose
a color scale. We use the following method to create and draw the grind onto
a canvas with a red, yellow, green color scale.

```js
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
```

We now need to add the canvas to scene using `Forma.terrain.groundTexture`

```js
await Forma.terrain.groundTexture.add({
  name: "noise-results",
  canvas: canvas,
  position: {
    x: groundResult.x0 + (groundResult.width * groundResult.scale.x) / 2,
    y: groundResult.y0 - (groundResult.height * groundResult.scale.y) / 2,
    z: 29,
  },
  scale: groundResult.scale,
});
```
