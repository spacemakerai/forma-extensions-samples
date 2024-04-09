import { Forma } from "forma-embedded-view-sdk/auto";
import ColorBuildings from "../../misc/color-buildings/ColorBuildings.tsx";
import { exportStl } from "../../misc/export-stl/export-stl.ts";
import { FlyThrough } from "../../misc/fly-trough/FlyThrough.tsx";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

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
      <ExampleItem
        name="Color Buildings"
        text="Select a building and paint it your favorite color"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/feat/make-one-extension/"
      >
        <ColorBuildings />
      </ExampleItem>
      <ExampleItem
        text="Export your proposal as an STL"
        name="Export as proposal as STL"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/feat/make-one-extension/src/features/export-stl/export-stl.ts"
      >
        <weave-button variant="solid" onClick={exportStl}>
          Export
        </weave-button>
      </ExampleItem>
      <ExampleItem
        name="Fly though scene"
        text={`
            The fly through extension allows you to define different camera
            positions and create a fly by in the scene with your desired
            transition time
        `}
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/feat/make-one-extension/src/features/fly-trough/FlyThrough.tsx"
      >
        <FlyThrough />
      </ExampleItem>
      <ExampleItem
        text="Order geo3 Data. This will only work in Finland, so you need to create a project there to test out this example"
        name="Order geo3 data"
        url="https://github.com/spacemakerai/forma-extensions-samples/tree/feat/make-one-extension/src/features/geo3/index.ts"
      >
        <weave-button variant="solid" onClick={exportStl}>
          Order data
        </weave-button>
      </ExampleItem>
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

function ExampleItem({
  text,
  children,
  name,
  url,
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
