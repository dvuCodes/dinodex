import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dinodex.vercel.app"),
  title: "Dinodex — Dinosaur Encyclopedia",
  description:
    "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Dinodex — Dinosaur Encyclopedia",
    description:
      "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Dinodex — A Pokédex-style Dinosaur Encyclopedia with 30 dinosaurs and 3 evolution stages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dinodex — Dinosaur Encyclopedia",
    description:
      "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;900&family=Noto+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
