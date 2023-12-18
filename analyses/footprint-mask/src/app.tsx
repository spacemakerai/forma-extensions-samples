import CalculateAndDraw from "./components/Calculate";

export default function App() {
  return (
    <>
      <h2>Footprint mask</h2>
      <div class="section">
        <p>Calculate and visualize a footprint mask as seen from above</p>
      </div>
      <CalculateAndDraw />
    </>
  );
}
