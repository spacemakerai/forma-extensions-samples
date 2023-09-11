import { CalendarIcon } from './assets/CalendarIcon'
import { Forma } from "forma-embedded-view-sdk/auto"
import { useState } from 'preact/hooks'
import _ from 'lodash'

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

async function saveScreen(name, width, height) {
  const canvas = await Forma.camera.capture({ width, height });

  const save_link = document.createElement("a");
  save_link.href = canvas.toDataURL("image/png");
  save_link.download = name + ".png";
  const event = new MouseEvent("click", { bubbles: false, cancelable: false });
  save_link.dispatchEvent(event);
}

export function App() {
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [interval, setInterval] = useState(60)
  const [startHour, setStartHour] = useState(8)
  const [startMinute, setStartMinute] = useState(0)
  const [endHour, setEndHour] = useState(20)
  const [endMinute, setEndMinute] = useState(0)
  const [resolution, setResolution] = useState("2048x1536")

  const onCLickRun = async () => {
    try {
      const existingDate = await Forma.sun.getDate();

      const width = parseInt(resolution.split("x")[0], 10);
      const height = parseInt(resolution.split("x")[1], 10);

      const startDate = new Date();
      startDate.setMonth(month);
      startDate.setDate(day);
      startDate.setHours(startHour);
      startDate.setMinutes(startMinute);
      startDate.setSeconds(0);

      const endDate = new Date();
      endDate.setMonth(month);
      endDate.setDate(day);
      endDate.setHours(endHour);
      endDate.setMinutes(endMinute);
      endDate.setSeconds(0);

      while (startDate.getTime() <= endDate.getTime()) {
        await Forma.sun.setDate({ date: startDate });
        await saveScreen(startDate.toString(), width, height);

        startDate.setTime(startDate.getTime() + interval * 60 * 1000);
      }

      await Forma.sun.setDate({ date: existingDate });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <div class={"section"}>
        <h1>Shadow study</h1>
      </div>

      <div class={"section"}>
        <CalendarIcon />
        <div class="selectors">
          <select class="month" value={month} onchange={e => setMonth(e.target.value)}>
            {MONTHS.map((name, value) => <option value={value}>{name}</option>)}
          </select>
          <select class="date" value={day} onchange={e => setDay(e.target.value)}>
            {_.range(1, 31).map(value => <option value={value}>{value}</option>)}
          </select>
        </div>
      </div>


      <div class="section">
        <select id="interval" class="large" value={interval} onchange={e => setInterval(e.target.value)}>
          <option value="5">Image every 5th minute</option>
          <option value="15">Image every 15th minute</option>
          <option value="30">Image every 30th minute</option>
          <option value="60" selected>Image every hour</option>
          <option value="120">Image every 2nd hour</option>
        </select>
      </div>

      <div class="section">
        <select class="timepicker" value={startHour} onchange={e => setStartHour(e.target.value)}>
          {_.range(25).map(value => <option value={value}>{value < 10 ? "0" + value : value}</option>)}
        </select>
        <select class="timepicker" value={startMinute} onchange={e => setStartMinute(e.target.value)}>
          {_.range(60).map(value => <option value={value}>{value < 10 ? "0" + value : value}</option>)}
        </select>
        -
        <select class="timepicker" value={endHour} onchange={e => setEndHour(e.target.value)}>
          {_.range(25).map(value => <option value={value}>{value < 10 ? "0" + value : value}</option>)}
        </select>
        <select class="timepicker" value={endMinute} onchange={e => setEndMinute(e.target.value)}>
          {_.range(60).map(value => <option value={value}>{value < 10 ? "0" + value : value}</option>)}
        </select>
      </div>

      <div class="section">
        <div class="timeindicator" id="timeindicator">
          <div class="pre-line"></div>
          <div class="start"></div>
          <div class="line"></div>
          <div class="end"></div>
          <div class="post-line"></div>
        </div>
      </div>

      <div class="section">
        <select class="large" value={resolution} onchange={e => setResolution(e.target.value)}>
          <option value="512x384">Small (512x384)</option>
          <option value="1024x768">Medium (1024x768)</option>
          <option value="2048x1536">Large (2048x1536)</option>
          <option value="3840x2160">4K (3840x2160)</option>
        </select>
      </div>

      <div class="section">
        <button class="export" onclick={onCLickRun}>Export Images</button>
      </div>
    </>
  )
}
