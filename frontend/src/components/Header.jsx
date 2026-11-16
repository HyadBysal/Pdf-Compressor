import { TOOLS } from "../data/content.js";
import { navigate } from "../lib/router.js";

export default function Header({ activeTool, onSelectTool }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img
            className="brand__logo"
            src="/logo-light.svg"
            alt="ipdfplumber"
            width={166}
            height={25}
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
      </div>
    </header>
  );
}
