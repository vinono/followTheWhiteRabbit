"use client";

import React from "react";
import { RabbitEdge } from "../content/artworks";

interface WhiteRabbitProps {
  edge: RabbitEdge;
  isExiting: boolean;
  onClick: () => void;
}

export function WhiteRabbit({ edge, isExiting, onClick }: WhiteRabbitProps) {
  return (
    <button
      className={`whiteRabbit edge-${edge} ${isExiting ? "isExiting" : ""}`}
      onClick={onClick}
      aria-label="Follow the White Rabbit"
      title="Follow the White Rabbit"
    >
      <svg
        className="rabbitSvg"
        viewBox="0 0 40 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Minimalist rabbit head & ears silhouette */}
        <path
          d="M 14 26 C 11 12 13 4 17 4 C 20 4 20 16 20 26 C 20 16 20 4 23 4 C 27 4 29 12 26 26 C 33 28 36 34 35 44 C 34 49 6 49 5 44 C 4 34 7 28 14 26 Z"
          fill="#FFFFFF"
          stroke="#333333"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Eye dot */}
        <circle cx="15" cy="33" r="1.2" fill="#222222" />
      </svg>
    </button>
  );
}
