import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taken Dashboard",
  description: "Beheer je taken en plannning, met ruimte voor een Akiflow-koppeling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
