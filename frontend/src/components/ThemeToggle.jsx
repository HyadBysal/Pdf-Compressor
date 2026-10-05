export default function ThemeToggle({ theme, onChange }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => onChange(isDark ? "light" : "dark")}
    >
      <img
        src={isDark ? "/icons/light-mode-switch.svg" : "/icons/dark-mode-switch.svg"}
        alt=""
        width={36}
        height={36}
      />
    </button>
  );
}
