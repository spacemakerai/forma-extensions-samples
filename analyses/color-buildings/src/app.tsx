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
      const { r, g, b } = selectedColor;
      const a = Math.round(selectedColor.a * 255);

      const position = await Forma.geometry.getTriangles({ path });
      const numTriangles = position.length / 3;
      const color = new Uint8Array(numTriangles * 4);
      for (let i = 0; i < numTriangles; i += 1) {
        color[i * 4 + 0] = r;
        color[i * 4 + 1] = g;
        color[i * 4 + 2] = b;
        color[i * 4 + 3] = a;
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
