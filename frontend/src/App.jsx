import { useState } from "react";
import Header from "./components/Header.jsx";
import ToolPanel from "./components/ToolPanel.jsx";
import Features from "./components/Features.jsx";
import Faq from "./components/Faq.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("dark");
  const [activeTool, setActiveTool] = useState("compress");

  return (
    <div className="page" data-theme={theme} id="top">
      <Header
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main>
        <section className="hero">
          <div className="hero__backdrop" aria-hidden="true">
            <span className="hero__glow hero__glow--magenta" />
            <span className="hero__glow hero__glow--cyan" />
          </div>

          <div className="hero__inner">
            <div className="hero__heading">
              <h1 className="hero__title">
                Everything PDF. All in One Place.
              </h1>
              <p className="hero__subtitle">
                Powerful PDF tools. 100% free. Effortlessly simple. Merge,
                split, compress, convert, rotate, unlock, and watermark PDFs
                in seconds.
              </p>
            </div>

            <div className="hero__tool">
              <ToolPanel activeTool={activeTool} onSelectTool={setActiveTool} />
              <p className="hero__privacy">
                Your files remain private and will be deleted after leaving
                our site.
              </p>
            </div>
          </div>
        </section>

        <Features activeTool={activeTool} onSelectTool={setActiveTool} />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}

export default App;
