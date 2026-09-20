"use client";

import Image from "next/image";
import { type CSSProperties, useSyncExternalStore } from "react";
import { type RabbitEdge } from "../content/artworks";
import styles from "./WhiteRabbit.module.css";

interface WhiteRabbitProps {
  edge: RabbitEdge;
  position: number;
  isExiting: boolean;
  onClick: () => void;
}

function subscribeToWidth(callback: () => void) {
  const query = window.matchMedia("(max-width: 760px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function isNarrow() { return window.matchMedia("(max-width: 760px)").matches; }
function serverWidth() { return false; }

export function WhiteRabbit({ edge, position, isExiting, onClick }: WhiteRabbitProps) {
  const narrow = useSyncExternalStore(subscribeToWidth, isNarrow, serverWidth);
  // Keep the smaller phone cue on a horizontal frame edge, away from the centre.
  const safeEdge = narrow && (edge === "left" || edge === "right")
    ? edge === "left" ? "top" : "bottom"
    : edge;
  return (
    <button
      className={`${styles.rabbitButton} ${styles[safeEdge]} ${isExiting ? styles.exiting : ""}`}
      style={{ "--rabbit-position": `${position}%` } as CSSProperties}
      onClick={onClick}
      disabled={isExiting}
      aria-label="Follow the White Rabbit"
      title="Follow the White Rabbit"
    >
      <Image
        className={styles.asset}
        src={`/rabbit/white-rabbit-${safeEdge}-v1.webp`}
        alt=""
        width={512}
        height={768}
        sizes="(max-width: 760px) 76px, 100px"
        draggable={false}
        priority
        unoptimized
      />
    </button>
  );
}
