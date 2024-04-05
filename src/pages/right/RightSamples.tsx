import { ComponentChildren } from "preact";
import { exportToExcel } from "../../features/export-to-excel/ExportToExcel";
import { calculateAndDrawFootprint } from "../../features/footprint-mask/FootprintMask";
import PredictiveWind from "../../features/predictive-wind/PredictiveWind";
import TerrainSlope from "../../features/terrain-slope/TerrainSlope";
import { useState } from "preact/hooks";

export default function App() {
  window.focus();

  return (
    <div className="wrapper">
      <h2>Welcome to Forma's sample extensions</h2>
      <p style="font: --var(medium-high-regular);">
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
      >
        {" "}
        <weave-button weave-button onClick={exportToExcel} variant="solid">
          Export area metrics to excel
        </weave-button>
      </ExampleItem>
      {/* <div className="example-item"></div>
      <div style="width: 100%;">
        <forma-expanded-tooltip
          target-id="footprint-mask-button"
          text="Footprint mask"
          loadingduration="100"
          help-url="https://github.com/spacemakerai/forma-extensions-samples"
          position="bottom"
        >
          <p></p>
        </forma-expanded-tooltip>
        <weave-button
          id="footprint-mask-button"
          variant="solid"
          onClick={calculateAndDrawFootprint}
        >
          Footprint mask
        </weave-button>
      </div>
      <PredictiveWind />
      <TerrainSlope /> */}
    </div>
  );
}

function ExampleItem({
  text,
  children,
  name,
}: {
  text: string;
  name: string;
  children: ComponentChildren;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  return (
    <div className="example-item">
      <forma-expanded-tooltip
        target-id={`${name}-button`}
        text={name}
        loadingduration="100"
        help-url="https://github.com/spacemakerai/forma-extensions-samples"
        position="bottom"
      >
        <p>{text}</p>
      </forma-expanded-tooltip>
      <div onClick={() => setIsExpanded(!isExpanded)}>
        <weave-button variant="solid">{name}</weave-button>
      </div>
      {isExpanded && children}
    </div>
  );
}
