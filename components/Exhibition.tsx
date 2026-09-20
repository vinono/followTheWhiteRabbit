"use client";

import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { artworks, exhibition, getArtworkUrl } from "../content/artworks";
import { useExhibitionFSM } from "../lib/exhibition-fsm";
import { WhiteRabbit } from "./WhiteRabbit";
import { EndScreen } from "./EndScreen";
import { GalleryDock } from "./GalleryDock";

const artworkSizes = "(max-width: 760px) calc(100vw - 3rem), min(760px, 58vw)";

export function Exhibition() {
  const [isDockOpen, setIsDockOpen] = useState(false);
  const dockRef = useRef<HTMLElement | null>(null);
  const dockTriggerRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const wasDockOpen = useRef(false);
  const {
    current, status, rabbit, completed, generation,
    onArtworkLoaded, startExhibition, onRabbitClick, gotoArtwork,
  } = useExhibitionFSM(isDockOpen);
  const artwork = artworks[current];
  const isIntro = status === "INTRO";
  const isEnding = status === "ENDING";
  const nextArtwork = isIntro ? artworks[0] : artworks[current + 1];

  if (nextArtwork && !isEnding) {
    const { props } = getImageProps({
      src: getArtworkUrl(nextArtwork),
      alt: "",
      width: nextArtwork.width,
      height: nextArtwork.height,
      sizes: artworkSizes,
    });
    preload(props.src, {
      as: "image",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority: "low",
    });
  }

  const closeDock = useCallback(() => setIsDockOpen(false), []);
  useEffect(() => {
    if (wasDockOpen.current && !isDockOpen) dockTriggerRef.current?.focus();
    wasDockOpen.current = isDockOpen;
    if (!isDockOpen) return;
    const dialog = dockRef.current;
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDock();
      if (event.key !== "Tab" || !dialog) return;
      const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([tabindex="-1"]):not([disabled])'));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDockOpen, closeDock]);

  useEffect(() => {
    if (generation > 0) stageRef.current?.focus({ preventScroll: true });
  }, [generation]);

  const chooseArtwork = (index: number) => {
    gotoArtwork(index);
    setIsDockOpen(false);
  };

  return (
    <main className="exhibition">
      <section
        ref={stageRef}
        className={`stage ${isIntro || isEnding ? "textStage" : ""}`}
        tabIndex={-1}
        inert={isDockOpen}
        aria-label={isIntro ? "展览序言" : isEnding ? "展览结束" : `Artwork ${current + 1} of ${artworks.length}`}
      >
        {isIntro ? (
          <article className="artworkFrame textFrame introFrame">
            <div className="introContent">
              <p className="eyebrow">{exhibition.eyebrow}</p>
              <h1>{exhibition.title}</h1>
              <div className="introText">
                {exhibition.about.map((paragraph, index) => (
                  <p
                    className={index === exhibition.about.length - 1 ? "finalLine" : undefined}
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <button className="startButton" onClick={startExhibition}>
                开始观看 <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ) : isEnding ? <EndScreen /> : (
          <>
            <div className="frameScene">
              <div className="artworkFrame">
                <Image
                  key={generation}
                  className={`artwork ${status === "LOADING_ARTWORK" ? "isLoading" : "isLoaded"}`}
                  src={getArtworkUrl(artwork)}
                  alt={artwork.alt}
                  width={artwork.width}
                  height={artwork.height}
                  onLoad={onArtworkLoaded}
                  priority
                  sizes={artworkSizes}
                />
              </div>
              {rabbit && (status === "RABBIT_VISIBLE" || status === "RABBIT_EXITING") && !isDockOpen && (
                <WhiteRabbit
                  edge={rabbit.edge}
                  position={rabbit.position}
                  isExiting={status === "RABBIT_EXITING"}
                  onClick={onRabbitClick}
                />
              )}
            </div>
            <div className="label">
              <span className="exhibitionTitle">{exhibition.title}</span>
              <span className="collectionName">{artwork.title || exhibition.collectionLabel}</span>
            </div>
          </>
        )}
      </section>
      {status === "RABBIT_VISIBLE" && !isDockOpen && (
        <p className="srOnly" role="status">White Rabbit is ready to follow.</p>
      )}
      {completed && (
        <div className="dockTriggerWrap" inert={isDockOpen}>
          <button
            ref={dockTriggerRef}
            className="dockTrigger"
            onClick={() => setIsDockOpen(true)}
            aria-expanded={isDockOpen}
            aria-controls="gallery-dock"
            aria-haspopup="dialog"
          >
            <span className="srOnly">Browse artworks</span>
          </button>
        </div>
      )}
      {/* The completed exhibition opens into a circular photo gallery. */}
      {isDockOpen && (
        <>
          <div className="dockBackdrop" onClick={closeDock} aria-hidden="true" />
          <GalleryDock
            current={isIntro || isEnding ? null : current}
            dialogRef={dockRef}
            onChoose={chooseArtwork}
            onClose={closeDock}
          />
        </>
      )}
    </main>
  );
}
