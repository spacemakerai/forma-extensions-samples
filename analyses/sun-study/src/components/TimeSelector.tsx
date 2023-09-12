import _ from "lodash";

type TimeSelectorProps = {
  startHour: number;
  setStartHour: (startHour: number) => void;
  startMinute: number;
  setStartMinute: (startMinute: number) => void;
  endHour: number;
  setEndHour: (endHour: number) => void;
  endMinute: number;
  setEndMinute: (endMinute: number) => void;
};

export default function TimeSelector(props: TimeSelectorProps) {
  const { startHour, setStartHour, startMinute, setStartMinute, endHour, setEndHour, endMinute, setEndMinute } = props;

  return (
    <div class="section">
      <select class="timepicker" value={startHour} onChange={(event) => setStartHour(parseInt(event.target.value, 10))}>
        {_.range(25).map((value) => (
          <option value={value}>{value < 10 ? "0" + value : value}</option>
        ))}
      </select>
      :
      <select
        class="timepicker"
        value={startMinute}
        onChange={(event) => setStartMinute(parseInt(event.target.value, 10))}
      >
        {_.range(60).map((value) => (
          <option value={value}>{value < 10 ? "0" + value : value}</option>
        ))}
      </select>
      -
      <select class="timepicker" value={endHour} onChange={(event) => setEndHour(parseInt(event.target.value, 10))}>
        {_.range(25).map((value) => (
          <option value={value}>{value < 10 ? "0" + value : value}</option>
        ))}
      </select>
      :
      <select class="timepicker" value={endMinute} onChange={(event) => setEndMinute(parseInt(event.target.value))}>
        {_.range(60).map((value) => (
          <option value={value}>{value < 10 ? "0" + value : value}</option>
        ))}
      </select>
    </div>
  );
}
