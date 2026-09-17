import type { Metadata } from "next";
import { exhibition } from "../content/artworks";
import "./globals.css";

export const metadata: Metadata = {
  title: exhibition.title,
  description: exhibition.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
