type IntervalSelectorProps = {
  interval: number;
  setInterval: (interval: number) => void;
};

export default function IntervalSelector(props: IntervalSelectorProps) {
  const { interval, setInterval } = props;
  return (
    <div class="section">
      <select
        id="interval"
        class="large"
        value={interval}
        onChange={(event) => setInterval(parseInt(event.currentTarget.value, 10))}
      >
        <option value="5">Image every 5th minute</option>
        <option value="15">Image every 15th minute</option>
        <option value="30">Image every 30th minute</option>
        <option value="60">Image every hour</option>
        <option value="120">Image every 2nd hour</option>
      </select>
    </div>
  );
}
