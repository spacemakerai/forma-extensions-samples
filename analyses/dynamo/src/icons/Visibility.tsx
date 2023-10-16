function VisibilityOnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.2463 7.73304C13.3214 7.83566 13.3808 7.92551 13.4259 8.00006C13.3808 8.07461 13.3214 8.16444 13.2463 8.26706C13.0009 8.60249 12.6239 9.02525 12.1278 9.43793C11.134 10.2647 9.72752 11 8 11C6.27032 11 4.86386 10.265 3.87084 9.43882C3.37513 9.02637 2.99854 8.60383 2.75351 8.26849C2.67824 8.16548 2.61878 8.07533 2.57363 8.00061C2.61879 7.92596 2.67821 7.83595 2.7534 7.73309C2.99854 7.39773 3.37524 6.975 3.87101 6.56231C4.86421 5.73558 6.27061 5 8 5C9.72701 5 11.1335 5.73522 12.1275 6.5621C12.6237 6.97481 13.0008 7.39759 13.2463 7.73304ZM14.5 8C14.5 8.55115 12.0464 12 8 12C3.95 12 1.5 8.55342 1.5 8C1.5 7.44998 3.95 4 8 4C12.0454 4 14.5 7.44885 14.5 8ZM9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8Z"
      ></path>
    </svg>
  );
}
function VisibilityOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.887 2.81663C13.0618 2.60291 13.0303 2.2879 12.8166 2.11304C12.6029 1.93817 12.2879 1.96967 12.113 2.1834L3.11302 13.1834C2.93816 13.3971 2.96966 13.7121 3.18338 13.887C3.3971 14.0619 3.71211 14.0304 3.88698 13.8166L5.69163 11.6109C6.38703 11.8514 7.15902 12 8 12C12.0464 12 14.5 8.55116 14.5 8.00002C14.5 7.61894 13.3266 5.85261 11.2652 4.79877L12.887 2.81663ZM10.6151 5.59338L6.37409 10.7768C6.87754 10.9176 7.42064 11 8 11C9.72752 11 11.134 10.2648 12.1278 9.43795C12.6239 9.02526 13.0009 8.6025 13.2463 8.26707C13.3214 8.16446 13.3808 8.07462 13.4259 8.00007C13.3808 7.92552 13.3214 7.83568 13.2463 7.73305C13.0008 7.3976 12.6237 6.97482 12.1275 6.56212C11.6979 6.20477 11.1913 5.86454 10.6151 5.59338ZM8 4.00002C8.43391 4.00002 8.84952 4.03969 9.24576 4.11122L8.50152 5.02085C8.33752 5.00717 8.17032 5.00002 8 5.00002C6.27061 5.00002 4.86421 5.73559 3.87101 6.56233C3.37524 6.97501 2.99854 7.39775 2.7534 7.73311C2.67821 7.83596 2.61879 7.92598 2.57363 8.00062C2.61878 8.07535 2.67824 8.16549 2.75351 8.26851C2.99854 8.60385 3.37513 9.02639 3.87084 9.43883C4.06551 9.6008 4.27606 9.75926 4.50183 9.90936L3.86593 10.6866C2.34615 9.64968 1.5 8.32525 1.5 8.00002C1.5 7.44999 3.95 4.00002 8 4.00002Z"
      ></path>
    </svg>
  );
}

export function Visibility({
  onClick,
  isVisible,
}: {
  onClick: () => void;
  isVisible: boolean;
}) {
  return (
    <div onClick={onClick} style={{ padding: "4px", cursor: "pointer" }}>
      {isVisible ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
    </div>
  );
}
