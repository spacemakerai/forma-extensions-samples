# Dipping toes in Forma

In this task we will dip our toes in the Forma API.
We will make a small selection logic, call the geometry api, make a few filters and export to xsl. 

## Test the setup by running the extension in Forma

Run the following command (or similar) in this folder 

```bash
npx http-server -c-1 --port 8081
```

This will expose the index.html in this folder on http://localhost:8081/index.html.

Now you can install the unpublished `local_testing` extension in Forma and open this
extension on the right hand side.

You should now see a single header saying `Hello AECTech` in the right hand side of Forma.

In this first example we're not running a live code server, so you will need to manually refresh
your extension. You can do this by clicking twice on the Extension icon in the right hand side.
This will reload the extension with new content from the local server.

## Start by adding a button to the index.html

```html
<button id="btn">Click Here!<button>
```

```js
document.getElementById("btn").onclick = async () => console.log("hello")
```

## Get the current selection

Inside the onclick handler add a call to the `Forma.selection.getSelection()` method.

Test it out by printing the selection to the console and selecting diferent parts of the 
scene while clicking the button.

## Getting metrics

Use the current selection to call the `Forma.areaMetrics.calculate` method. 
You can console.log this and play around with the selection. 

## Export these metrics to excel

add these imports:

```js
import ExcelJS from "https://esm.sh/exceljs";
import { saveAs } from "https://esm.sh/file-saver";
```

You should now be able to export your metrics with the following helper function: 

```js
async function exportToExcel(customMetrics) {
  const headerRow = ["Metric name", "Function name", "Value", "Unit"];
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet();
  const header = ws.addRow(headerRow);
  header.font = { bold: true };
  for (const metric of customMetrics) {
    for (const breakdown of metric.functionBreakdown) {
      ws.addRow([
        metric.name,
        breakdown.functionName,
        breakdown.value,
        metric.unitOfMeasurement,
      ]);
    }
  }
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Custom_area_metrics.xlsx");
}
```