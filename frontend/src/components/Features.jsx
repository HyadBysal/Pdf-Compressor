import { FEATURES } from "../data/content.js";

export default function Features({ activeTool, onSelectTool }) {
  return (
    <section className="features-section">
      <h2 className="section-title">Our Features</h2>
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
            <img
              className="feature-icon"
              src={`/icons/${feature.icon}.svg`}
              alt=""
              width={48}
              height={48}
            />
            <div className="feature-card__copy">
              <div className="feature-card__title">{feature.title}</div>
              <div className="feature-card__desc">{feature.description}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
