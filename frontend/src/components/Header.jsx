import ThemeToggle from "./ThemeToggle.jsx";
import { TOOLS } from "../data/content.js";

export default function Header({ activeTool, onSelectTool, theme, onThemeChange }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#top">
          <img
            className="brand__logo"
            src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
            alt="ipdfplumber"
            height={20}
          />
        </a>

        <nav className="nav-tabs" aria-label="PDF tools">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={
                tool.id === activeTool ? "nav-tab is-active" : "nav-tab"
              }
              onClick={() => onSelectTool(tool.id)}
            >
              {tool.label}
            </button>
          ))}
        </nav>

        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}
