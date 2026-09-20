"use client";

import React from "react";
import Link from "next/link";

export default function Prototype3DRabbitPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Return to Exhibition Navigation */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "1.5rem",
          zIndex: 9999,
          background: "rgba(18, 20, 26, 0.85)",
          color: "#ffffff",
          padding: "0.55rem 1.1rem",
          borderRadius: "999px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
          textDecoration: "none",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
        }}
      >
        <span>← 返回摄影展览</span>
      </Link>

      <iframe
        src="/prototype-3d-rabbit.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        title="3D Snowball White Rabbit Prototype"
      />
    </div>
  );
}

