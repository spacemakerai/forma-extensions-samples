import { useState } from "preact/hooks";
import DateSelector from "./components/DateSelector";
import ExportButton from "./components/ExportButton";
import IntervalSelector from "./components/IntervalSelector";
import ResolutionSelector from "./components/ResolutionSelector";
import TimeIndicator from "./components/TimeIndicator";
import TimeSelector from "./components/TimeSelector";

export function App() {
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [interval, setInterval] = useState(60);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(20);
  const [endMinute, setEndMinute] = useState(0);
  const [resolution, setResolution] = useState("2048x1536");

  return (
    <>
      <div class={"section"}>
        <h1>Shadow study</h1>
      </div>

      <DateSelector month={month} setMonth={setMonth} day={day} setDay={setDay} />
      <IntervalSelector interval={interval} setInterval={setInterval} />
      <TimeSelector
        startHour={startHour}
        setStartHour={setStartHour}
        startMinute={startMinute}
        setStartMinute={setStartMinute}
        endHour={endHour}
        setEndHour={setEndHour}
        endMinute={endMinute}
        setEndMinute={setEndMinute}
      />
      <TimeIndicator startHour={startHour} startMinute={startMinute} endHour={endHour} endMinute={endMinute} />
      <ResolutionSelector resolution={resolution} setResolution={setResolution} />
      <ExportButton
        month={month}
        day={day}
        startHour={startHour}
        startMinute={startMinute}
        endHour={endHour}
        endMinute={endMinute}
        resolution={resolution}
        interval={interval}
      />
    </>
  );
}
