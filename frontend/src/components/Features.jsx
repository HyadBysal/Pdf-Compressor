import { FEATURES } from "../data/content.js";

export default function Features({ activeTool, onSelectTool }) {
  return (
    <div className="features-grid">
      {FEATURES.map((feature) => (
        <button
          key={feature.id}
          type="button"
          className={
            feature.id === activeTool
              ? "feature-card is-active"
              : "feature-card"
          }
          onClick={() => onSelectTool(feature.id)}
        >
          <div className="feature-card__inner">
            <span className="feature-card__icon">
              <img
                className="feature-icon"
                src={`/icons/${feature.icon}.svg`}
                alt=""
                width={40}
                height={40}
              />
            </span>
            <div className="feature-card__title">{feature.title}</div>
            <span className="feature-card__divider" aria-hidden="true" />
            <div className="feature-card__desc">{feature.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
