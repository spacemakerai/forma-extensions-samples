import formaApi from "forma-sdk";

const timeindicator = document.getElementById("timeindicator");

function updateTimeIndicator() {
  const startHour = parseInt(document.getElementById("startHour").value, 10);
  const startMinute = parseInt(
    document.getElementById("startMinute").value,
    10
  );
  const endHour = parseInt(document.getElementById("endHour").value, 10);
  const endMinute = parseInt(document.getElementById("endMinute").value, 10);

  const width = 212;

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const startPos = Math.floor((startMinutes * width) / (24 * 60));
  const endPos = Math.floor((endMinutes * width) / (24 * 60));
  const lineLength = Math.floor(
    ((endMinutes - startMinutes) * width) / (24 * 60)
  );

  const [preLineNode] = timeindicator.getElementsByClassName("pre-line");
  preLineNode.style.width = startPos + "px";
  const [lineNode] = timeindicator.getElementsByClassName("line");
  lineNode.style.width = lineLength + "px";
  const [postLineNode] = timeindicator.getElementsByClassName("post-line");
  postLineNode.style.width = width - endPos + "px";
}

updateTimeIndicator();

document.getElementById("startHour").onchange = updateTimeIndicator;
document.getElementById("startMinute").onchange = updateTimeIndicator;
document.getElementById("endHour").onchange = updateTimeIndicator;
document.getElementById("endMinute").onchange = updateTimeIndicator;
document.getElementById("interval").onchange = updateTimeIndicator;

document.getElementById("run").onclick = async () => {
  const existingDate = await formaApi.ui.sun.get();

  const month = parseInt(document.getElementById("month").value, 10);
  const day = parseInt(document.getElementById("day").value, 10);
  const startHour = parseInt(document.getElementById("startHour").value, 10);
  const startMinute = parseInt(
    document.getElementById("startMinute").value,
    10
  );
  const endHour = parseInt(document.getElementById("endHour").value, 10);
  const endMinute = parseInt(document.getElementById("endMinute").value, 10);

  const interval = parseInt(document.getElementById("interval").value, 10);
  const resolution = document.getElementById("resolution").value;
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
    await formaApi.ui.sun.set(startDate);
    await saveScreen(startDate.toString(), width, height);

    startDate.setTime(startDate.getTime() + interval * 60 * 1000);
  }

  await formaApi.ui.sun.set(existingDate);
};

async function saveScreen(name, width, height) {
  const url = await formaApi.ui.camera.capture(width, height);

  const save_link = document.createElement("a");
  save_link.href = url;
  save_link.download = name + ".png";
  const event = new MouseEvent("click", { bubbles: false, cancelable: false });
  save_link.dispatchEvent(event);
}
