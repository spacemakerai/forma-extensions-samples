import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
const html = htm.bind(h);

export function Cheveron({ open, onClick, style }) {
  return html`
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick=${onClick}
      style=${{
        cursor: "pointer",
        transform: `rotate(${open ? 0 : 90}deg)`,
        transition: "transform 0.2s ease-in-out",
        ...style,
      }}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.6557 15.9795L9.90575 12.4196L10.5942 11.6943L14 14.9275L17.4057 11.6943L18.0942 12.4196L14.3442 15.9795L14 16.3063L13.6557 15.9795Z"
        fill="#808080"
      />
    </svg>
  `;
}
