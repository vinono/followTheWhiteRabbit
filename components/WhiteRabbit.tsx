"use client";

import Image from "next/image";
import { RabbitEdge } from "../content/artworks";
import styles from "./WhiteRabbit.module.css";

interface WhiteRabbitProps {
  edge: RabbitEdge;
  isExiting: boolean;
  onClick: () => void;
}

const rabbitAssetByEdge: Record<RabbitEdge, string> = {
  left: "/rabbit/white-rabbit-left-v1.webp",
  right: "/rabbit/white-rabbit-right-v1.webp",
  top: "/rabbit/white-rabbit-top-v1.webp",
  bottom: "/rabbit/white-rabbit-bottom-v1.webp",
};

export function WhiteRabbit({ edge, isExiting, onClick }: WhiteRabbitProps) {
  return (
    <button
      className={`whiteRabbit ${styles.rabbitButton} ${styles[edge]} ${
        isExiting ? styles.exiting : ""
      }`}
      onClick={onClick}
      aria-label="Follow the White Rabbit"
      title="Follow the White Rabbit"
    >
      <Image
        className={styles.asset}
        src={rabbitAssetByEdge[edge]}
        alt=""
        width={512}
        height={768}
        sizes="(max-width: 760px) 130px, 180px"
        draggable={false}
        priority
        unoptimized
      />
    </button>
  );
}
