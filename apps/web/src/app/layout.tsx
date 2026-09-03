import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aperture Education Preview",
  description: "A local, in-memory preview of Aperture's Education feature.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
