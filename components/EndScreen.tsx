"use client";

import React from "react";
import { exhibition } from "../content/artworks";

interface EndScreenProps {
  onRestart: () => void;
}

export function EndScreen({ onRestart }: EndScreenProps) {
  return (
    <div className="endScreen" role="dialog" aria-labelledby="end-title">
      <div className="endContent">
        <h2 id="end-title" className="endTitle">
          {exhibition.endMessage}
        </h2>
        <button className="restartBtn" onClick={onRestart}>
          <span>Restart</span>
          <svg className="restartIcon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3.5 10a6.5 6.5 0 1 0 1.9-4.6M3.5 4.5v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
