export default function ThemeToggle({ theme, onChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={theme === "dark" ? "theme-toggle__btn is-active" : "theme-toggle__btn"}
        aria-pressed={theme === "dark"}
        onClick={() => onChange("dark")}
      >
        Dark
      </button>
      <button
        type="button"
        className={theme === "light" ? "theme-toggle__btn is-active" : "theme-toggle__btn"}
        aria-pressed={theme === "light"}
        onClick={() => onChange("light")}
      >
        Light
      </button>
    </div>
  );
}
