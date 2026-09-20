export default function DocIcon() {
  return (
    <svg width="80" height="108" viewBox="0 0 80.004 107.938" aria-hidden="true">
      <defs>
        <linearGradient id="idlDoc" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0.0186" stopColor="#EFEFEF" />
          <stop offset="0.9768" stopColor="#D5D5D5" />
        </linearGradient>
        <linearGradient id="idlFold" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#B0B0B0" />
          <stop offset="1" stopColor="#E9E9E9" />
        </linearGradient>
      </defs>
      <path
        d="M 49.816 0 L 80.004 30.188 L 80.004 99.938 C 80.004 104.356 76.422 107.937 72.004 107.938 L 8 107.938 C 3.582 107.938 0 104.356 0 99.938 L 0 8 C 0 3.582 3.582 0 8 0 L 49.816 0 Z"
        fill="url(#idlDoc)"
      />
      <path
        d="M 49.816 0 L 80.004 30.188 L 57.816 30.188 C 53.398 30.188 49.816 26.606 49.816 22.188 L 49.816 0 Z"
        fill="url(#idlFold)"
      />
    </svg>
  );
}
