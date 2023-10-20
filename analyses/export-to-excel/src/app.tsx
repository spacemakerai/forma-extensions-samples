import {Forma} from "forma-embedded-view-sdk/auto";
import ExcelJS from "exceljs";
import {saveAs} from "file-saver";
import {MetricWithFunctionBreakdown} from "forma-embedded-view-sdk/areaMetrics";

async function exportToExcel(customMetrics: MetricWithFunctionBreakdown[]) {
    const headerRow = ["Metric name", "Function name", "Value", "Unit"]
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet();
    const header = ws.addRow(headerRow);
    header.font = {bold: true};
    for (const metric of customMetrics) {
        for (const breakdown of metric.functionBreakdown) {
            ws.addRow([metric.name, breakdown.functionName, breakdown.value, metric.unitOfMeasurement])
        }
    }
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Custom_area_metrics.xlsx");
}

export function App() {

    const onClickExport = async () => {
        const areaMetrics = await Forma.areaMetrics.calculate({})
        await exportToExcel(areaMetrics.customMetrics)
    }

    return (
        <div>
            <h3>Export-to-excel extension</h3>
            <div>Export your custom area metrics to excel</div>
            <button onClick={onClickExport}>Export</button>
        </div>
    )
}
