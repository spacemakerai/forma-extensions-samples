import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
const html = htm.bind(h);
export function Plus({ onClick }) {
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
      d="M7 7V2H8V7H13V8H8V13H7V8H2V7H7Z"
      fill="#808080"
    />
  </svg>`;
}
