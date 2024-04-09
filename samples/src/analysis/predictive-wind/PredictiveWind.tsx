import { predictWind } from "./predict.ts";

export default function PredictiveWind() {
  return (
    <>
      <weave-select name="comfortScale" id="comfortScale" value="lawson_lddc">
        <weave-select-option value="lawson_lddc">
          lawson_lddc
        </weave-select-option>
        <weave-select-option value="davenport">davenport</weave-select-option>
        <weave-select-option value="nen8100">nen8100</weave-select-option>
      </weave-select>
      <weave-button onClick={predictWind}>
        Click here, then scene position
      </weave-button>
      <div id="info" />
    </>
  );
}
