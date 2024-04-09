import { Forma } from "forma-embedded-view-sdk/auto";
import { useState, useEffect } from "preact/hooks";

const DEFAULT_COLOR = "#0000ff";

function hexToRGB(hex: string) {
  return {
    r: parseInt(hex.substring(1, 3), 16),
    g: parseInt(hex.substring(3, 5), 16),
    b: parseInt(hex.substring(5, 7), 16),
  };
}

export default function ColorBuildings() {
  const [buildingPaths, setBuildingPaths] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);

  useEffect(() => {
    const fetchData = () => {
      Forma.geometry
        .getPathsByCategory({ category: "building" })
        .then(setBuildingPaths)
        .catch((err: unknown) => {
          console.log(err);
        });
    };
    fetchData();
  }, []);

  const colorBuildings = async () => {
    const selectedPaths = await Forma.selection.getSelection();
    console.log(selectedPaths);
    console.log(selectedColor);
    const rgbColor = hexToRGB(selectedColor);
    for (const path of selectedPaths) {
      if (buildingPaths.includes(path)) {
        const position = await Forma.geometry.getTriangles({
          path,
        });

        const numTriangles = position.length / 3;
        const color = new Uint8Array(numTriangles * 4); // each triangle needs rgba values
        for (let i = 0; i < numTriangles; i += 1) {
          color[i * 4 + 0] = rgbColor.r;
          color[i * 4 + 1] = rgbColor.g;
          color[i * 4 + 2] = rgbColor.b;
          color[i * 4 + 3] = Math.round(1 * 255);
        }
        const geometryData = { position, color };
        Forma.render.updateMesh({ id: path, geometryData });
      }
    }
  };

  const reset = () => {
    Forma.render.cleanup();
    setSelectedColor(DEFAULT_COLOR);
  };

  return (
    <>
      <div class="section">
        <p>
          Total number of buildings: {buildingPaths?.length}
          <span style="margin-left: 10px;">
            <weave-button onClick={reset}>Reset</weave-button>
          </span>
        </p>
      </div>
      <div style="display: flex;">
        <input
          type="color"
          onChange={(e) => {
            setSelectedColor(e.currentTarget.value);
          }}
          value={selectedColor}
        />
        <div class="section">
          <weave-button onClick={colorBuildings} disabled={!buildingPaths}>
            Color buildings
          </weave-button>
        </div>
      </div>
    </>
  );
}
