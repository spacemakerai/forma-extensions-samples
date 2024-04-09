import { Forma } from "forma-embedded-view-sdk/auto";
import { useState, useEffect } from "preact/hooks";

const DEFAULT_COLOR = "#0000ff";

export default function ColorBuildings() {
  const [isActive, setIsActive] = useState<boolean>(false);
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
    const colorMap = selectedPaths.reduce((acc, path) => {
      if (buildingPaths.includes(path)) {
        acc.set(path, selectedColor);
      }
      return acc;
    }, new Map<string, string>());
    await Forma.render.elementColors.set({ pathsToColor: colorMap });
    // for (let path of selectedPaths) {
    //   if (buildingPaths.includes(path)) {
    //     const position = await Forma.geometry.getTriangles({
    //       path,
    //     });
    //     const numTriangles = position.length / 3;
    //     const color = new Uint8Array(numTriangles * 4); // each triangle needs rgba values
    //     for (let i = 0; i < numTriangles; i += 1) {
    //       color[i * 4 + 0] = rgbColor.r;
    //       color[i * 4 + 1] = rgbColor.g;
    //       color[i * 4 + 2] = rgbColor.b;
    //       color[i * 4 + 3] = Math.round(1 * 255);
    //     }
    //     const geometryData = { position, color };
    //     Forma.render.updateMesh({ id: path, geometryData });
    //   }
    // }
  };

  const reset = () => {
    Forma.render.cleanup();
    setSelectedColor(DEFAULT_COLOR);
  };

  return (
    <>
      <weave-button
        onClick={() => {
          setIsActive(!isActive);
        }}
        variant="solid"
        width="100%"
      >
        Color Buildings
      </weave-button>
      {isActive && (
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
      )}
    </>
  );
}
