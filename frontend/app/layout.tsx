import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Pro Clubs API Console",
  description: "Test UI for protected EA FC Pro Clubs proxy APIs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
