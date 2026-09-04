"use client";

import { useEffect, useState } from "react";
import { artworks, exhibition, getArtworkUrl } from "../content/artworks";
import { useExhibitionFSM } from "../lib/exhibition-fsm";
import { WhiteRabbit } from "./WhiteRabbit";
import { EndScreen } from "./EndScreen";

export function Exhibition() {
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const {
    current,
    status,
    activeEdge,
    onRabbitClick,
    gotoArtwork,
    restartExhibition,
  } = useExhibitionFSM(isDockOpen || isAboutOpen);

  const artwork = artworks[current];
  const isEnding = status === "ENDING";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDockOpen(false);
        setIsAboutOpen(false);
      }
      if (!isAboutOpen && !isDockOpen) {
        if (event.key === "ArrowRight") {
          gotoArtwork(Math.min(current + 1, artworks.length - 1));
        }
        if (event.key === "ArrowLeft") {
          gotoArtwork(Math.max(current - 1, 0));
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAboutOpen, isDockOpen, current, gotoArtwork]);

  const chooseArtwork = (index: number) => {
    gotoArtwork(index);
    setIsDockOpen(false);
  };

  const handleHomeClick = () => {
    gotoArtwork(0);
    setIsAboutOpen(false);
  };

  return (
    <main className="exhibition">
      <nav className="sideNav" aria-label="Exhibition navigation">
        <button className="sideNavItem" onClick={handleHomeClick}>
          <svg className="dropIcon" viewBox="0 0 20 26" aria-hidden="true">
            <path d="M10 1.5C8 5.8 3 10.2 3 15.1a7 7 0 0 0 14 0C17 10.2 12 5.8 10 1.5Z" />
          </svg>
          <span className="sideNavLabel">Home</span>
        </button>
        <button className="sideNavItem" onClick={() => setIsAboutOpen(true)}>
          <svg className="dropIcon" viewBox="0 0 20 26" aria-hidden="true">
            <path d="M10 1.5C8 5.8 3 10.2 3 15.1a7 7 0 0 0 14 0C17 10.2 12 5.8 10 1.5Z" />
          </svg>
          <span className="sideNavLabel">About</span>
        </button>
      </nav>

      {/* Main Exhibition Stage */}
      <section className="stage" aria-live="polite">
        {isEnding ? (
          <EndScreen onRestart={restartExhibition} />
        ) : (
          <>
            <div className="artworkFrame">
              <img
                key={artwork.file}
                className="artwork"
                src={getArtworkUrl(artwork)}
                alt={artwork.alt}
              />
            </div>
            <div className="label" aria-label={`Artwork ${current + 1} of ${artworks.length}`}>
              <span className="exhibitionTitle">{exhibition.title}</span>
              <strong className="artworkNumber">
                {artwork.label} / {String(artworks.length).padStart(2, "0")}
              </strong>
              <span className="collectionName">
                {artwork.title ? artwork.title : exhibition.collectionLabel}
              </span>
            </div>
          </>
        )}
      </section>

      {/* White Rabbit Interactive Trigger */}
      {activeEdge && !isEnding && (
        <WhiteRabbit
          edge={activeEdge}
          isExiting={status === "RABBIT_EXITING"}
          onClick={onRabbitClick}
        />
      )}

      {/* Manual / Reduced-motion direct next button */}
      {!isEnding && current < artworks.length - 1 && (
        <button
          className="reducedMotionNext"
          onClick={() => gotoArtwork(current + 1)}
          aria-label="Next artwork"
          title="Next artwork"
        >
          <span>Next</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Gallery Dock Trigger */}
      <button
        className="dockTrigger"
        onClick={() => setIsDockOpen((open) => !open)}
        aria-expanded={isDockOpen}
        aria-controls="gallery-dock"
      >
        <span className="srOnly">Browse artworks</span>
      </button>

      {/* Gallery Dock */}
      {isDockOpen && (
        <section id="gallery-dock" className="dock" aria-label="Browse artworks">
          <div className="dockHeader">
            <span>All works</span>
            <span>{artworks.length} photographs</span>
          </div>
          <div className="thumbRail">
            {artworks.map((item, index) => (
              <button
                className={`thumbnail ${index === current ? "isCurrent" : ""}`}
                key={item.file}
                onClick={() => chooseArtwork(index)}
                aria-label={`View artwork ${index + 1}`}
              >
                <img src={getArtworkUrl(item)} alt="" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* About Overlay */}
      {isAboutOpen && (
        <section
          className="aboutBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          onMouseDown={() => setIsAboutOpen(false)}
        >
          <article className="about" onMouseDown={(event) => event.stopPropagation()}>
            <button
              className="close"
              onClick={() => setIsAboutOpen(false)}
              aria-label="Close about"
            >
              ×
            </button>
            <p className="eyebrow">{exhibition.eyebrow}</p>
            <h1 id="about-title">{exhibition.title}</h1>
            {exhibition.about.map((paragraph, index) => (
              <p
                className={index === exhibition.about.length - 1 ? "finalLine" : ""}
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
          </article>
        </section>
      )}
    </main>
  );
}
