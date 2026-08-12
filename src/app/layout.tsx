import { JsonLd } from "@/components/json-ld";
import { ToastContextProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://mrashed21.me"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "ZeroMeta — Premium Media Privacy Tool",
    template: "%s | ZeroMeta",
  },
  description:
    "Strip hidden metadata, GPS location, C2PA manifests, SynthID watermarks, and AI fingerprints from images securely.",
  keywords: [
    "ZeroMeta",
    "EXIF remover",
    "metadata cleaner",
    "media privacy tool",
    "GPS location remover",
    "C2PA remover",
  ],
  authors: [{ name: "Muhammad Rashed", url: "https://github.com/mrashed21" }],
  creator: "Muhammad Rashed",
  publisher: "ZeroMeta",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icon-512.png" },
  ],
  openGraph: {
    type: "website",
    title: "ZeroMeta — Secure Media Processing",
    description:
      "Remove EXIF metadata and AI watermarks from your images completely offline. Fast, private, seamless.",
    siteName: "ZeroMeta",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroMeta — Premium Metadata Remover",
    description:
      "Instantly strip metadata from your photos and videos completely locally.",
    creator: "@mrashed21",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
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
    <html lang="en" className={cn("dark", poppins.variable)}>
      <body
        className={cn(
          "app-background text-foreground antialiased selection:bg-primary/30",
          poppins.className,
        )}
      >
        <JsonLd />
        <ToastContextProvider>{children}</ToastContextProvider>
      </body>
    </html>
  );
}
