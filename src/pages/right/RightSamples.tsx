import { ComponentChildren } from "preact";
import { exportToExcel } from "../../misc/export-to-excel/ExportToExcel.tsx";
import { calculateAndDrawFootprint } from "../../analysis/footprint-mask/FootprintMask.tsx";
import PredictiveWind from "../../analysis/predictive-wind/PredictiveWind.tsx";
import TerrainSlope from "../../analysis/terrain-slope/TerrainSlope.tsx";
import { useState } from "preact/hooks";

export default function App() {
  window.focus();

  return (
    <div className="wrapper">
      <h2>Welcome to Forma's sample extensions</h2>
      <p style="font: --var(medium-high-regular); border-bottom: 1px solid var(--divider-lightweight);">
        This extensions tries to display some of the functionality that the
        Forma embedded view SDK can enable and where we recommend their
        placement to be. This part of the extension displays what sort of
        functionality we recommend in the right analysis panel; everything
        related to analysis of the project. If you open the extension in the in
        the left panel, you will see functionality like data extensions, and
        configurations. If you hover the buttons you will see a tooltip with a
        description of the feature and pressing h will send you to the source
        code. This entire example can be found{" "}
        <a href="https://github.com/spacemakerai/forma-extensions-samples">
          here
        </a>
      </p>
      <ExampleItem
        text={`
                  Calculate and visualize a footprint mask as seen from above. If you
                  hide buildings and surrounding buildings in the Layers list it is
                  easier to see the mask.
      `}
        name="Export area metrics to excel"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/main/src/analysis/export-to-excel/ExportToExcel.tsx"
      >
        {" "}
        <weave-button weave-button onClick={exportToExcel} variant="solid">
          Export area metrics to excel
        </weave-button>
      </ExampleItem>
      <ExampleItem
        text={`
                  Calculate and visualize a footprint mask as seen from above. 
                  If you hide buildings and surrounding buildings in the Layers list it is 
                  easier to see the mask.
      `}
        name="Footprint mask"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/main/src/analysis/footprint-mask/FootprintMask.tsx"
      >
        <weave-button variant="solid" onClick={calculateAndDrawFootprint}>
          Footprint mask
        </weave-button>
      </ExampleItem>
      <ExampleItem
        text={`
                  Predict the wind based on the selected comfort scale.
      `}
        name="Predictive wind"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/main/src/analysis/predictive-wind/predict.ts"
      >
        <PredictiveWind />
      </ExampleItem>
      <ExampleItem
        name="Terrain slope"
        text={`Calculate the slope of the terrain and draw a ground texture
            representing the steepness, where red is steeper than the threshold.
            This example uses the Storage API to store the results with a given
            setting to avoid recalculation.`}
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/main/src/analysis/terrain-slope/TerrainSlope.tsx"
      >
        <TerrainSlope />
      </ExampleItem>
    </div>
  );
}

function ExampleItem({
  text,
  children,
  url,
  name,
}: {
  text: string;
  name: string;
  url: string;
  children: ComponentChildren;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  return (
    <div className="example-item">
      <forma-expanded-tooltip
        target-id={`${name}-button`}
        text={name}
        loadingduration="100"
        help-url={url}
        position="top"
      >
        <p>{text}</p>
      </forma-expanded-tooltip>
      <div
        id={`${name}-button`}
        className={`example-item-header ${isExpanded ? "expanded" : ""}`}
      >
        <p>{name}</p>
        <weave-icon-button
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="transform: rotate(0deg); transition: all 200ms ease 0s;"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.35347 2.70727L4.35207 5.70727L3.99843 6.06074L3.64496 5.70711L0.646362 2.70711L1.35363 2.00016L3.99876 4.64653L6.64653 2L7.35347 2.70727Z"
              fill="currentColor"
            />
          </svg>
        </weave-icon-button>
      </div>
      {isExpanded && children}
    </div>
  );
}
