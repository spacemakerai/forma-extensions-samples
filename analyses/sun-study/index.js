import formaApi from "forma-sdk";

const monthInput = document.getElementById("month");
const dayInput = document.getElementById("day");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

const btn = document.getElementById("run");
btn.addEventListener("click", async () => {
  const existingDate = await formaApi.ui.sun.get();

  const month = parseInt(monthInput.value, 10);
  const day = parseInt(dayInput.value, 10);
  const start = parseInt(startInput.value, 10);
  const end = parseInt(endInput.value, 10);

  const d = new Date();
  d.setMonth(month);
  d.setDate(day);
  d.setMinutes(0);
  d.setSeconds(0);

  for (let i = start; i <= end; i++) {
    d.setHours(i);
    await formaApi.ui.sun.set(d);
    await saveScreen(d.toString());
  }

  await formaApi.ui.sun.set(existingDate);
});

async function saveScreen(name) {
  const url = await formaApi.ui.camera.capture(1024, 768);

  const save_link = document.createElement("a");
  save_link.href = url;
  save_link.download = name + ".png";
  const event = new MouseEvent("click", { bubbles: false, cancelable: false });
  save_link.dispatchEvent(event);
}
