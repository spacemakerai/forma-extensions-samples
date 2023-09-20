const INDICATOR_WIDTH = 212;

const minutesToPixels = (minutes: number) => {
  return Math.floor((minutes * INDICATOR_WIDTH) / (24 * 60));
};

type TimeIndicatorProps = {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

export default function TimeIndicator(props: TimeIndicatorProps) {
  const { startHour, startMinute, endHour, endMinute } = props;

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const numMinutes = endMinutes - startMinutes;

  return (
    <div class="section">
      <div class="timeindicator" id="timeindicator">
        <div class="pre-line" style={{ width: minutesToPixels(startMinutes) + "px" }}></div>
        <div class="start"></div>
        <div class="line" style={{ width: minutesToPixels(numMinutes) + "px" }}></div>
        <div class="end"></div>
        <div class="post-line" style={{ width: INDICATOR_WIDTH - minutesToPixels(endMinutes) + "px" }}></div>
      </div>
    </div>
  );
}
