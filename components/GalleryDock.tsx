"use client";

import Image from "next/image";
import { type CSSProperties, type PointerEvent, type Ref, useRef, useState } from "react";
import { artworks, getArtworkUrl } from "../content/artworks";
import styles from "./GalleryDock.module.css";

interface GalleryDockProps {
  current: number | null;
  dialogRef: Ref<HTMLElement>;
  onChoose: (index: number) => void;
  onClose: () => void;
}

const count = artworks.length;
const wrap = (index: number) => (index % count + count) % count;

export function GalleryDock({ current, dialogRef, onChoose, onClose }: GalleryDockProps) {
  const [centre, setCentre] = useState(current ?? 0);
  const [dragOffset, setDragOffset] = useState(0);
  const cards = useRef<Array<HTMLButtonElement | null>>([]);
  const gesture = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const move = (step: number, focusCard = false) => {
    const next = wrap(centre + step);
    setCentre(next);
    if (focusCard) requestAnimationFrame(() => cards.current[next]?.focus({ preventScroll: true }));
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId) return;
    if (active.moved) {
      suppressClick.current = true;
      if (!cancelled) {
        const spacing = Math.max(72, event.currentTarget.clientWidth * 0.16);
        const distance = active.x - event.clientX;
        const steps = Math.max(1, Math.round(Math.abs(distance) / spacing));
        move(Math.sign(distance) * steps);
      }
    }
    gesture.current = null;
    setDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section
      id="gallery-dock"
      ref={dialogRef}
      className={styles.dock}
      role="dialog"
      aria-modal="true"
      aria-label="Browse artworks"
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1, event.target instanceof HTMLElement && event.target.dataset.card === "true");
      }}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>THE COLLECTION</p>
          <h2>回到某个瞬间</h2>
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close gallery dock">×</button>
      </header>
      <div
        className={`${styles.orbit} ${dragOffset ? styles.dragging : ""}`}
        aria-label="环形照片画廊"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          suppressClick.current = false;
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
        }}
        onPointerMove={(event) => {
          const active = gesture.current;
          if (!active || active.id !== event.pointerId) return;
          const dx = event.clientX - active.x;
          const dy = event.clientY - active.y;
          if (!active.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            active.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          if (active.moved) setDragOffset(dx / Math.max(72, event.currentTarget.clientWidth * 0.16));
        }}
        onPointerUp={(event) => finishDrag(event)}
        onPointerCancel={(event) => finishDrag(event, true)}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div className={styles.orbitLine} aria-hidden="true" />
        {artworks.map((item, index) => {
          const base = wrap(index - centre + count / 2) - count / 2;
          const offset = base + dragOffset;
          const angle = offset * 2 * Math.PI / count;
          const depth = 1 - Math.cos(angle);
          const isVisible = Math.abs(base) <= 3;
          const isCentred = index === centre;
          const style: CSSProperties = {
            transform: `translate(-50%, 0) translate3d(calc(var(--ring-radius) * ${Math.sin(angle)}), ${depth * 125}px, ${-depth * 160}px) rotateY(${-offset * 8}deg) rotateZ(${offset * 3}deg) scale(${1 - Math.min(Math.abs(offset), 6) * 0.065})`,
            zIndex: 20 - Math.round(Math.abs(offset) * 2),
            opacity: isVisible ? 1 - Math.abs(base) * 0.08 : 0,
          };
          return (
            <button
              key={item.file}
              ref={(node) => { cards.current[index] = node; }}
              className={`${styles.card} ${isCentred ? styles.centred : ""}`}
              style={style}
              data-card="true"
              aria-label={`View artwork ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              aria-hidden={!isVisible}
              tabIndex={isCentred ? 0 : -1}
              inert={!isVisible}
              onClick={() => onChoose(index)}
            >
              <span className={styles.photo}>
                <Image src={getArtworkUrl(item)} alt="" width={item.width} height={item.height} loading="lazy" draggable={false} sizes="(max-width: 760px) 150px, 230px" />
              </span>
              <span className={styles.meta}>
                <span className={styles.number}>{item.label}</span>
                <span className={styles.title}>{item.title}</span>
              </span>
            </button>
          );
        })}
      </div>
      <footer className={styles.footer}>
        <button className="dockTrigger" onClick={onClose} aria-label="Close gallery">
          <span className="srOnly">Close gallery</span>
        </button>
      </footer>
    </section>
  );
}
