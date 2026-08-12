import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets:  ["latin"],
  display:  "swap",
  variable: "--font-inter",
  // Load only the weights we actually use for performance
  weight:   ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ["latin"],
  display:  "swap",
  variable: "--font-mono",
  weight:   ["400", "500"],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  "mrashed21 — Media Metadata Remover",
    template: "%s | mrashed21",
  },
  description:
    "Remove EXIF metadata, GPS location, C2PA manifests, SynthID watermarks, and AI fingerprints from images. Fast client-side processing. No data stored on our servers.",
  keywords: [
    "EXIF remover",
    "metadata remover",
    "GPS location remover",
    "C2PA remover",
    "SynthID remover",
    "AI watermark remover",
    "image cleaner",
    "privacy tool",
    "mrashed21",
    "muhammad rashed",
  ],
  authors: [{ name: "Muhammad Rashed", url: "https://github.com/mrashed21" }],
  creator:    "Muhammad Rashed",
  publisher:  "Muhammad Rashed",
  manifest:   "/manifest.json",
  icons: [
    { rel: "icon",             url: "/icon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icon-512.png" },
  ],
  openGraph: {
    type:        "website",
    title:       "mrashed21 — Media Metadata Remover",
    description: "Remove EXIF metadata, GPS location, C2PA manifests and AI watermarks from your images. Fast, private, free.",
    siteName:    "mrashed21 Media Processor",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "mrashed21 — Media Metadata Remover",
    description: "Remove EXIF metadata, GPS location, C2PA manifests and AI watermarks from your images.",
    creator:     "@mrashed21",
  },
  robots: {
    index:   true,
    follow:  true,
  },
};

export const viewport: Viewport = {
  themeColor:   "#09090b",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("dark", inter.variable, jetbrainsMono.variable)}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Ambient background — fixed, behind all content */}
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          {/* Violet radial glow at top */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.55_0.27_293/0.12),transparent)]" />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
