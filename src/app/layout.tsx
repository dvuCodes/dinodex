import type { Metadata } from "next";
import { JetBrains_Mono, M_PLUS_Rounded_1c, Noto_Sans } from "next/font/google";
import "./globals.css";

const displayFont = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Dinodex — Dinosaur Encyclopedia",
  description:
    "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
  metadataBase: new URL("https://dinodex.app"),
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Dinodex — Dinosaur Encyclopedia",
    description:
      "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-text-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
