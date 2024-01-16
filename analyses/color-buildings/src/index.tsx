import {render} from 'preact';
import './style.css';
import {Forma} from "forma-embedded-view-sdk/auto";
import {useState, useEffect} from "preact/hooks";
import {RgbaColor, RgbaColorPicker} from "powerful-color-picker";

const DEFAULT_COLOR = {
    r: 0,
    g: 255,
    b: 255,
    a: 1.0,
};

function App() {
    const [buildingPaths, setBuildingPaths] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<RgbaColor>(DEFAULT_COLOR);

    useEffect(() => {
        const fetchData = async () => {
            Forma.geometry
                .getPathsByCategory({category: "building"})
                .then(setBuildingPaths);
        };
        fetchData();
    }, []);

    const colorBuildings = async () => {
        const selectedPaths = await Forma.selection.getSelection()
        for (let path of selectedPaths) {
            if (buildingPaths.includes(path)) {
                const position = await Forma.geometry.getTriangles({
                    path,
                });
                const numTriangles = position.length / 3;
                const color = new Uint8Array(numTriangles * 4); // each triangle needs rgba values
                for (let i = 0; i < numTriangles; i += 1) {
                    color[i * 4 + 0] = selectedColor.r;
                    color[i * 4 + 1] = selectedColor.g;
                    color[i * 4 + 2] = selectedColor.b;
                    color[i * 4 + 3] = Math.round(selectedColor.a * 255);
                }
                const geometryData = {position, color};
                Forma.render.updateMesh({id: path, geometryData});

            }
        }
    };

    const reset = () => {
        Forma.render.cleanup();
        setSelectedColor(DEFAULT_COLOR);
    }

    return (
        <>
            <div class="section">
                <p>Total number of buildings: {buildingPaths?.length}</p>
            </div>
            <RgbaColorPicker color={selectedColor} onChange={setSelectedColor}/>
            <div class="section">
                <button onClick={colorBuildings} disabled={!buildingPaths}>Color buildings</button>
                <button onClick={reset}>Reset</button>
            </div>
        </>
    );
}

render(<App/>, document.getElementById('app'));