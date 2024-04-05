import { useState } from "preact/hooks";
import { predictWind } from "./predict";

export default function PredictiveWind() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style="width: 100%;">
      <forma-expanded-tooltip
        target-id="predictive-wind"
        text="Predictive wind"
        loadingduration="100"
        help-url="https://github.com/spacemakerai/forma-extensions-samples"
        position="bottom"
      >
        <p>Predict the wind</p>
      </forma-expanded-tooltip>
      <weave-button
        id="predictive-wind"
        variant="solid"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Predictive wind
      </weave-button>
      {isExpanded && (
        <>
          <h2>Predictive wind example</h2>
          <weave-select
            name="comfortScale"
            id="comfortScale"
            value="lawson_lddc"
          >
            <weave-select-option value="lawson_lddc">
              lawson_lddc
            </weave-select-option>
            <weave-select-option value="davenport">
              davenport
            </weave-select-option>
            <weave-select-option value="nen8100">nen8100</weave-select-option>
          </weave-select>
          <weave-button onClick={predictWind}>
            Click here, then scene position
          </weave-button>
          <div id="info"></div>
        </>
      )}
    </div>
  );
}
