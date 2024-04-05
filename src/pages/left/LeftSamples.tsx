import { Forma } from "forma-embedded-view-sdk/auto";
import ColorBuildings from "../../features/color-buildings/ColorBuildings";
import { exportStl } from "../../features/export-stl/export-stl";
import { FlyThrough } from "../../features/fly-trough/FlyThrough";

export default function LeftSamples() {
  window.focus();

  return (
    <div className="wrapper">
      <h2>Welcome to Forma's sample extensions</h2>
      <p style="font: --var(medium-high-regular);">
        This extensions tries to display some of the functionality that the
        Forma embedded view SDK can enable. This part of the extension displays
        what sort of functionality we recommend in the left panel, like data
        extensions, and configurations. If you open the extension in the right
        analysis menu, you will see analysis related functionality. Click the
        different features. You can also see how it will look in a floating
        panel if you click the button below. If you hover the buttons you will
        see a tooltip with a description of the feature and pressing h will send
        you to the source code. This entire example can be found{" "}
        <a href="https://github.com/spacemakerai/forma-extensions-samples">
          here
        </a>
      </p>
      <ColorBuildings />
      <weave-button variant="solid" onClick={exportStl}>
        Export project as stl
      </weave-button>
      <FlyThrough />
      <weave-button
        onClick={() =>
          Forma.openFloatingPanel({
            embeddedViewId: "abc",
            url: "http://localhost:8081/left.html",
            title: "As floating panel",
            preferredSize: {
              width: 400,
              height: 600,
            },
          })
        }
      >
        Open as floating panel
      </weave-button>
    </div>
  );
}
