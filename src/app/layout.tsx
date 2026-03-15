import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dinodex — Dinosaur Encyclopedia",
  description:
    "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
  openGraph: {
    title: "Dinodex — Dinosaur Encyclopedia",
    description:
      "A Pokédex-style encyclopedia for dinosaurs with anime-styled art, 30 curated dinosaurs, and 3 evolution stages each.",
    type: "website",
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
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;900&family=Noto+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
