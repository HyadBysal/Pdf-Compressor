import { useState } from "react";
import Header from "./components/Header.jsx";
import Features from "./components/Features.jsx";
import Footer from "./components/Footer.jsx";
import CompressPage from "./pages/CompressPage.jsx";
import MergePage from "./pages/MergePage.jsx";
import SplitPage from "./pages/SplitPage.jsx";
import { navigate, usePath } from "./lib/router.js";
import "./App.css";

function App() {
  const path = usePath();
  const [selectedTool, setSelectedTool] = useState("compress");
  const isCompressPage = path === "/compress";
  const isMergePage = path === "/merge";
  const isSplitPage = path === "/split";
  const activeTool = isCompressPage
    ? "compress"
    : isMergePage
      ? "merge"
      : isSplitPage
        ? "split"
        : selectedTool;

  function selectTool(id) {
    setSelectedTool(id);
    navigate(`/${id}`);
  }

  return (
    <div className="page" data-theme="light" id="top">
      <Header
        activeTool={activeTool}
        onSelectTool={selectTool}
      />

      <main>
        {isCompressPage ? (
          <CompressPage />
        ) : isMergePage ? (
          <MergePage />
        ) : isSplitPage ? (
          <SplitPage />
        ) : (
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
                <Features activeTool={activeTool} onSelectTool={selectTool} />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
