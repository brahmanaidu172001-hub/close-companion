import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Close Companion — AI Month-End Close Copilot",
  description:
    "An AI controller that continuously scans your books, subledgers, and operations to surface close risks before the month-end close even begins.",
  applicationName: "Close Companion",
  authors: [{ name: "Close Companion" }],
  metadataBase: new URL("https://close-companion.vercel.app"),
  openGraph: {
    title: "Close Companion — AI Month-End Close Copilot",
    description:
      "Pre-close risk detection. A senior AI controller, continuously monitoring the books.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Close Companion",
    description: "An AI Month-End Close Copilot.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1623",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased font-sans">
        <div className="relative isolate min-h-screen">
          <div className="pointer-events-none absolute inset-0 -z-10 grid-bg" />
          {children}
        </div>
      </body>
    </html>
  );
}
