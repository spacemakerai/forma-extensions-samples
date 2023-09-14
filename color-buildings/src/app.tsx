import { Forma } from "forma-embedded-view-sdk/auto";
import { useEffect, useState } from "preact/hooks";
import { RgbaColorPicker } from "powerful-color-picker";

const DEFAULT_COLOR = {
  r: 0,
  g: 255,
  b: 255,
  a: 1.0,
};

export function App() {
  const [buildings, setBuildings] = useState<string[] | undefined>();
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const fetchData = async () => {
      Forma.geometry
        .getPathsByCategory({ category: "buildings" })
        .then((res) => setBuildings(res));
    };

    fetchData();
  }, []);

  const onClickChange = async () => {
    const selection = await Forma.selection.getSelection();
    for (let path of selection) {
      if (!buildings.includes(path)) {
        continue;
      }
      const { r, g, b } = selectedColor;
      const a = Math.round(selectedColor.a * 255);

      const position = await Forma.geometry.getTriangles({ path });
      const color = new Uint8Array((position.length / 3) * 4);
      for (let i = 0; i < position.length / 3; i += 3) {
        color[i * 4 + 0] = color[i * 4 + 4] = color[i * 4 + 8] = r;
        color[i * 4 + 1] = color[i * 4 + 5] = color[i * 4 + 9] = g;
        color[i * 4 + 2] = color[i * 4 + 6] = color[i * 4 + 10] = b;
        color[i * 4 + 3] = color[i * 4 + 7] = color[i * 4 + 11] = a;
      }
      const geometryData = { position, color };
      Forma.render.updateMesh({ id: path, geometryData });
    }
  };
  const onClickReset = async () => {
    Forma.render.cleanup();
    setSelectedColor(DEFAULT_COLOR);
  };

  return (
    <>
      <div class="section">
        <p>Total number of buildings: {buildings?.length}</p>
      </div>
      <RgbaColorPicker color={selectedColor} onChange={setSelectedColor} />
      <div class="section">
        <button onClick={onClickChange}>Color selected buildings</button>
        <button onClick={onClickReset}>Reset</button>
      </div>
    </>
  );
}
