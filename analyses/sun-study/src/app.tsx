import { CalendarIcon } from "./assets/CalendarIcon";
import { Forma } from "forma-embedded-view-sdk/auto";
import { useState } from "preact/hooks";
import _ from "lodash";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const INDICATOR_WIDTH = 212;

const minutesToPixels = (minutes: number) => {
  return Math.floor((minutes * INDICATOR_WIDTH) / (24 * 60));
};

export function App() {
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [interval, setInterval] = useState(60);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(20);
  const [endMinute, setEndMinute] = useState(0);
  const [resolution, setResolution] = useState("2048x1536");

  const startMins = startHour * 60 + startMinute;
  const endMins = endHour * 60 + endMinute;
  const numMins = endMins - startMins;

  const onClickExport = async () => {
    try {
      const currentDate = await Forma.sun.getDate();
      const startDate = new Date(currentDate.getFullYear(), month, day, startHour, startMinute, 0, 0);
      const endDate = new Date(currentDate.getFullYear(), month, day, endHour, endMinute, 0, 0);
      const width = parseInt(resolution.split("x")[0], 10);
      const height = parseInt(resolution.split("x")[1], 10);

      const zip = new JSZip();
      const zipFolder = zip.folder("shadow-study") as JSZip;

      while (startDate.getTime() <= endDate.getTime()) {
        await Forma.sun.setDate({ date: startDate });

        const filename = startDate.toString() + ".png";
        const canvas = await Forma.camera.capture({ width, height });
        const data = canvas.toDataURL().split("base64,")[1];
        zipFolder.file(filename, data, { base64: true });

        startDate.setTime(startDate.getTime() + interval * 60 * 1000);
      }

      zipFolder.generateAsync({ type: "blob" }).then((content) => saveAs(content, "shadow-study.zip"));

      await Forma.sun.setDate({ date: currentDate });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div class={"section"}>
        <h1>Shadow study</h1>
      </div>

      <div class={"section"}>
        <CalendarIcon />
        <div class="selectors">
          <select class="month" value={month} onChange={(event) => setMonth(parseInt(event.target.value, 10))}>
            {MONTHS.map((name, value) => (
              <option value={value}>{name}</option>
            ))}
          </select>
          <select class="date" value={day} onChange={(event) => setDay(parseInt(event.target.value, 10))}>
            {_.range(1, 31).map((value) => (
              <option value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div class="section">
        <select
          id="interval"
          class="large"
          value={interval}
          onChange={(event) => setInterval(parseInt(event.target.value, 10))}
        >
          <option value="5">Image every 5th minute</option>
          <option value="15">Image every 15th minute</option>
          <option value="30">Image every 30th minute</option>
          <option value="60">Image every hour</option>
          <option value="120">Image every 2nd hour</option>
        </select>
      </div>

      <div class="section">
        <select
          class="timepicker"
          value={startHour}
          onChange={(event) => setStartHour(parseInt(event.target.value, 10))}
        >
          {_.range(25).map((value) => (
            <option value={value}>{value < 10 ? "0" + value : value}</option>
          ))}
        </select>
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
        <select class="timepicker" value={endMinute} onChange={(event) => setEndMinute(parseInt(event.target.value))}>
          {_.range(60).map((value) => (
            <option value={value}>{value < 10 ? "0" + value : value}</option>
          ))}
        </select>
      </div>

      <div class="section">
        <div class="timeindicator" id="timeindicator">
          <div class="pre-line" style={{ width: minutesToPixels(startMins) + "px" }}></div>
          <div class="start"></div>
          <div class="line" style={{ width: minutesToPixels(numMins) + "px" }}></div>
          <div class="end"></div>
          <div class="post-line" style={{ width: INDICATOR_WIDTH - minutesToPixels(endMins) + "px" }}></div>
        </div>
      </div>

      <div class="section">
        <select class="large" value={resolution} onChange={(event) => setResolution(event.target.value)}>
          <option value="512x384">Small (512x384)</option>
          <option value="1024x768">Medium (1024x768)</option>
          <option value="2048x1536">Large (2048x1536)</option>
          <option value="3840x2160">4K (3840x2160)</option>
        </select>
      </div>

      <div class="section">
        <button class="export" onClick={onClickExport}>
          Export Images
        </button>
      </div>
    </>
  );
}
