import { CompressIcon, MergeIcon, SplitIcon } from "./icons/FeatureIcons.jsx";
import { FEATURES } from "../data/content.js";

const ICONS = {
  compress: CompressIcon,
  merge: MergeIcon,
  split: SplitIcon,
};

export default function Features({ activeTool, onSelectTool }) {
  return (
    <section className="features-section">
      <h2 className="section-title">Our Features</h2>
      <div className="features-grid">
        {FEATURES.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
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
              <Icon />
              <div className="feature-card__copy">
                <div className="feature-card__title">{feature.title}</div>
                <div className="feature-card__desc">{feature.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
