import { Forma } from "forma-embedded-view-sdk/auto";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { MONTHS } from "../utils";
import { Button } from "../styles";

type ExportButtonProps = {
  month: number;
  day: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  resolution: string;
  interval: number;
};

export default function ExportButton(props: ExportButtonProps) {
  const { month, day, startHour, startMinute, endHour, endMinute, resolution, interval } = props;

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

        const filename = startDate.toString().split("2023")[1] + ".png";
        const canvas = await Forma.camera.capture({ width, height });
        const data = canvas.toDataURL().split("base64,")[1];
        zipFolder.file(filename, data, { base64: true });

        startDate.setTime(startDate.getTime() + interval * 60 * 1000);
      }

      zipFolder
        .generateAsync({ type: "blob" })
        .then((content) =>
          saveAs(content, "Shadow study - " + startDate.getDate() + " " + MONTHS[startDate.getMonth()] + ".zip"),
        );

      await Forma.sun.setDate({ date: currentDate });
    } catch (e) {
      console.log(e);
    }
  };

  return <Button onClick={onClickExport}>Export images</Button>;
}
