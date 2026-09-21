import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aperture Education Preview",
  description: "A private, synchronized personal dashboard for education, health, and finance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
