export function CompressIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="feature-icon" aria-hidden="true">
      <g transform="translate(5.89,0)">
        <path
          transform="translate(0,0.298)"
          d="M 25.275 0 L 26.304 1 L 4 1 C 2.343 1 1 2.343 1 4 L 1 43.702 C 1 45.359 2.343 46.702 4 46.702 L 31.776 46.702 C 33.433 46.702 34.776 45.359 34.776 43.702 L 34.776 9.235 L 35.776 10.208 L 35.776 43.702 L 35.771 43.908 C 35.668 45.953 34.028 47.593 31.982 47.696 L 31.776 47.702 L 4 47.702 L 3.794 47.696 C 1.749 47.592 0.109 45.953 0.005 43.908 L 0 43.702 L 0 4 C 0 1.86 1.681 0.112 3.794 0.005 L 4 0 L 25.275 0 Z"
          fill="#A0C5CF"
        />
        <path
          transform="matrix(-1,0,0,-1,35.995,11.091)"
          d="M 0.973 0.973 C 0.614 0.614 0.868 0 1.376 0 L 10.521 0 C 10.836 0 11.091 0.255 11.091 0.57 L 11.091 9.715 C 11.091 10.223 10.477 10.477 10.118 10.118 L 0.973 0.973 Z"
          fill="var(--accent)"
        />
        <g transform="translate(3.961,14.251)">
          <g transform="rotate(0 13.887 14.071)">
            <g transform="translate(18.1,14.07) rotate(180)">
              <path
                d="M 5.963 0 L 5.963 5.963 L 0 5.963"
                fill="none"
                stroke="#A0C5CF"
                strokeWidth="1"
                transform="matrix(0.707,0.707,-0.707,0.707,4.216,2.143)"
              />
              <path d="M 4.216 0 L 4.216 9.838" stroke="#A0C5CF" strokeWidth="1" />
            </g>
          </g>
          <g transform="rotate(90 13.887 14.071)">
            <g transform="translate(18.1,14.07) rotate(180)">
              <path
                d="M 5.963 0 L 5.963 5.963 L 0 5.963"
                fill="none"
                stroke="#A0C5CF"
                strokeWidth="1"
                transform="matrix(0.707,0.707,-0.707,0.707,4.216,2.143)"
              />
              <path d="M 4.216 0 L 4.216 9.838" stroke="#A0C5CF" strokeWidth="1" />
            </g>
          </g>
          <g transform="rotate(180 13.887 14.071)">
            <g transform="translate(18.1,14.07) rotate(180)">
              <path
                d="M 5.963 0 L 5.963 5.963 L 0 5.963"
                fill="none"
                stroke="#A0C5CF"
                strokeWidth="1"
                transform="matrix(0.707,0.707,-0.707,0.707,4.216,2.143)"
              />
              <path d="M 4.216 0 L 4.216 9.838" stroke="#A0C5CF" strokeWidth="1" />
            </g>
          </g>
          <g transform="rotate(270 13.887 14.071)">
            <g transform="translate(18.1,14.07) rotate(180)">
              <path
                d="M 5.963 0 L 5.963 5.963 L 0 5.963"
                fill="none"
                stroke="#A0C5CF"
                strokeWidth="1"
                transform="matrix(0.707,0.707,-0.707,0.707,4.216,2.143)"
              />
              <path d="M 4.216 0 L 4.216 9.838" stroke="#A0C5CF" strokeWidth="1" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

const OVERLAP_PATH =
  "M 4 0 L 4 0.5 L 26 0.5 L 26 0 L 26 -0.5 L 4 -0.5 L 4 0 Z M 30 4 L 29.5 4 L 29.5 26 L 30 26 L 30.5 26 L 30.5 4 L 30 4 Z M 26 30 L 26 29.5 L 4 29.5 L 4 30 L 4 30.5 L 26 30.5 L 26 30 Z M 0 5.937 L 0.5 5.937 L 0.5 4 L 0 4 L -0.5 4 L -0.5 5.937 L 0 5.937 Z M 0 26 L 0.5 26 L 0.5 17.241 L 0 17.241 L -0.5 17.241 L -0.5 26 L 0 26 Z M 4 30 L 4 29.5 C 2.067 29.5 0.5 27.933 0.5 26 L 0 26 L -0.5 26 C -0.5 28.485 1.515 30.5 4 30.5 L 4 30 Z M 30 26 L 29.5 26 C 29.5 27.933 27.933 29.5 26 29.5 L 26 30 L 26 30.5 C 28.485 30.5 30.5 28.485 30.5 26 L 30 26 Z M 26 0 L 26 0.5 C 27.933 0.5 29.5 2.067 29.5 4 L 30 4 L 30.5 4 C 30.5 1.515 28.485 -0.5 26 -0.5 L 26 0 Z M 4 0 L 4 -0.5 C 1.515 -0.5 -0.5 1.515 -0.5 4 L 0 4 L 0.5 4 C 0.5 2.067 2.067 0.5 4 0.5 L 4 0 Z";

const ARROW_PATH = "M 6 0 L 6 6 L 0 6";
const ARROW_STEM = "M 4.243 0 L 4.243 9.899";

export function MergeIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="feature-icon" aria-hidden="true">
      <path transform="matrix(-1,0,0,-1,30,30)" d={OVERLAP_PATH} fill="#A0C5CF" />
      <path transform="translate(18,18)" d={OVERLAP_PATH} fill="#A0C5CF" />
      <g transform="matrix(-0.707,0.707,-0.707,-0.707,17.941,12.440)">
        <g transform="matrix(-1,0,0,-1,8.485,10.642)">
          <path d={ARROW_PATH} fill="none" stroke="#A0C5CF" strokeWidth="1" transform="matrix(0.707,0.707,-0.707,0.707,4.243,2.157)" />
          <path d={ARROW_STEM} stroke="#A0C5CF" strokeWidth="1" />
        </g>
      </g>
      <g transform="matrix(-0.707,0.707,-0.707,-0.707,43.941,37.440)">
        <path d={ARROW_PATH} fill="none" stroke="#A0C5CF" strokeWidth="1" transform="matrix(0.707,0.707,-0.707,0.707,4.243,2.157)" />
        <path d={ARROW_STEM} stroke="#A0C5CF" strokeWidth="1" />
      </g>
      <path d="M 22 18 L 26 18 A 4 4 0 0 1 30 22 L 30 30 L 26 30 A 4 4 0 0 1 22 26 Z" fill="var(--accent)" />
    </svg>
  );
}

export function SplitIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="feature-icon" aria-hidden="true">
      <path transform="matrix(-1,0,0,-1,30,30)" d={OVERLAP_PATH} fill="#A0C5CF" />
      <path transform="translate(18,18)" d={OVERLAP_PATH} fill="#A0C5CF" />
      <g transform="matrix(-0.707,0.707,-0.707,-0.707,17.941,12.440)">
        <path d={ARROW_PATH} fill="none" stroke="#A0C5CF" strokeWidth="1" transform="matrix(0.707,0.707,-0.707,0.707,4.243,2.157)" />
        <path d={ARROW_STEM} stroke="#A0C5CF" strokeWidth="1" />
      </g>
      <g transform="matrix(0.707,-0.707,0.707,0.707,30.416,35.915)">
        <path d={ARROW_PATH} fill="none" stroke="#A0C5CF" strokeWidth="1" transform="matrix(0.707,0.707,-0.707,0.707,4.243,2.157)" />
        <path d={ARROW_STEM} stroke="#A0C5CF" strokeWidth="1" />
      </g>
      <path d="M 22 18 L 26 18 A 4 4 0 0 1 30 22 L 30 30 L 26 30 A 4 4 0 0 1 22 26 Z" fill="var(--accent)" />
    </svg>
  );
}
