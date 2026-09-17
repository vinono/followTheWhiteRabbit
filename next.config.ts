import type { NextConfig } from "next";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
const parsedMediaBaseUrl = mediaBaseUrl ? new URL(mediaBaseUrl) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: parsedMediaBaseUrl
      ? [
          {
            protocol: parsedMediaBaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: parsedMediaBaseUrl.hostname,
            port: parsedMediaBaseUrl.port,
            pathname: `${parsedMediaBaseUrl.pathname.replace(/\/$/, "")}/**`,
          },
        ]
      : [],
  },
};

export default nextConfig;
