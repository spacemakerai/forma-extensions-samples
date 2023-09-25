import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
const html = htm.bind(h);
export function Minus({ onClick }) {
  return html`<svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick=${onClick}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 8H2V7H13V8Z"
      fill="#808080"
    />
  </svg>`;
}
