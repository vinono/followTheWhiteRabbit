"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { artworks, exhibition, getArtworkUrl } from "../content/artworks";
import { useExhibitionFSM } from "../lib/exhibition-fsm";
import { usePrefersReducedMotion } from "../lib/prefers-reduced-motion";
import { WhiteRabbit } from "./WhiteRabbit";
import { EndScreen } from "./EndScreen";

interface ExhibitionProps {
  prefersReducedMotion?: boolean;
}

export function Exhibition({
  prefersReducedMotion: prefersReducedMotionProp,
}: ExhibitionProps = {}) {
  const detectedReducedMotion = usePrefersReducedMotion();
  const prefersReducedMotion = prefersReducedMotionProp ?? detectedReducedMotion;

  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const dockRef = useRef<HTMLElement | null>(null);
  const dockTriggerRef = useRef<HTMLButtonElement | null>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement | null>(null);
  const aboutDialogRef = useRef<HTMLElement | null>(null);
  const aboutCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  const {
    current,
    status,
    activeEdge,
    onRabbitClick,
    gotoArtwork,
    endExhibition,
    restartExhibition,
  } = useExhibitionFSM(isDockOpen || isAboutOpen, prefersReducedMotion);

  const artwork = artworks[current];
  const nextArtwork = artworks[current + 1];
  const isEnding = status === "ENDING";

  if (nextArtwork) {
    preload(getArtworkUrl(nextArtwork), { as: "image", fetchPriority: "low" });
  }

  const closeAbout = useCallback(() => {
    setIsAboutOpen(false);
    aboutTriggerRef.current?.focus();
  }, []);

  const openAbout = useCallback(() => {
    setIsAboutOpen(true);
  }, []);

  const closeDock = useCallback(() => {
    setIsDockOpen(false);
    dockTriggerRef.current?.focus();
  }, []);

  // Handle Escape key for overlays
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isAboutOpen) {
          closeAbout();
        }
        if (isDockOpen) {
          closeDock();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAboutOpen, isDockOpen, closeAbout, closeDock]);

  // Trap focus inside About modal when open
  useEffect(() => {
    if (!isAboutOpen) return;

    aboutCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !aboutDialogRef.current) return;

      const focusableElements = aboutDialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAboutOpen]);

  // Outside pointer click listener to close Dock
  useEffect(() => {
    if (!isDockOpen) return;

    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      const target = event.target as Node;
      if (
        dockRef.current &&
        !dockRef.current.contains(target) &&
        !dockTriggerRef.current?.contains(target)
      ) {
        setIsDockOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isDockOpen]);

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
        <button
          ref={aboutTriggerRef}
          className="sideNavItem"
          onClick={openAbout}
          aria-haspopup="dialog"
          aria-expanded={isAboutOpen}
        >
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
              <Image
                key={artwork.file}
                className="artwork"
                src={getArtworkUrl(artwork)}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
                priority
                sizes="(max-width: 760px) calc(100vw - 2rem), min(760px, 62vw)"
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
              {status === "VIEWING_FINAL_ARTWORK" && (
                <button className="endExhibitionBtn" onClick={endExhibition}>
                  结束展览
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {/* White Rabbit Interactive Trigger (hidden when Dock, About, or reduced motion is active) */}
      {!prefersReducedMotion && activeEdge && !isEnding && !isDockOpen && !isAboutOpen && (
        <WhiteRabbit
          edge={activeEdge}
          isExiting={status === "RABBIT_EXITING"}
          onClick={onRabbitClick}
        />
      )}
      {!prefersReducedMotion && status === "RABBIT_VISIBLE" && !isDockOpen && !isAboutOpen && (
        <p className="srOnly" role="status">
          White Rabbit is ready to follow.
        </p>
      )}

      {/* Reduced-motion direct next button */}
      {prefersReducedMotion && !isEnding && current < artworks.length - 1 && (
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
        ref={dockTriggerRef}
        className="dockTrigger"
        onClick={() => setIsDockOpen((open) => !open)}
        aria-expanded={isDockOpen}
        aria-controls="gallery-dock"
      >
        <span className="srOnly">Browse artworks</span>
      </button>

      {/* Gallery Dock */}
      {isDockOpen && (
        <>
          <div className="dockBackdrop" onClick={closeDock} aria-hidden="true" />
          <section
            id="gallery-dock"
            ref={dockRef}
            className="dock"
            aria-label="Browse artworks"
          >
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
                  aria-current={index === current ? "true" : undefined}
                >
                  <Image
                    src={getArtworkUrl(item)}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    sizes="84px"
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* About Overlay */}
      {isAboutOpen && (
        <section
          ref={aboutDialogRef}
          className="aboutBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          onMouseDown={closeAbout}
        >
          <article className="about" onMouseDown={(event) => event.stopPropagation()}>
            <button
              ref={aboutCloseButtonRef}
              className="close"
              onClick={closeAbout}
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
