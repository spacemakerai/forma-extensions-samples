import _ from "lodash";

type Props = {
  hour: number;
  setHour: (hour: number) => void;
  minute: number;
  setMinute: (minute: number) => void;
};

export default function TimePicker({ hour, setHour, minute, setMinute }: Props) {
  return (
    <div class="section">
      <h1>Time</h1>
      <select class="timepicker" value={hour} onChange={(e) => setHour(parseInt(e.currentTarget.value))} label="Hour">
        {_.range(0, 24).map((v) => (
          <option value={v}>{v}</option>
        ))}
      </select>
      :
      <select
        class="timepicker"
        value={minute}
        label="Minute"
        onChange={(e) => setMinute(parseInt(e.currentTarget.value, 10))}
      >
        {_.range(0, 60, 6).map((v) => (
          <option value={v}>{v < 10 ? `0${v}` : v}</option>
        ))}
      </select>
    </div>
  );
}
