import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Archivo_Black } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

export const metadata: Metadata = {
  title: "SYNAPZ",
  description: "Brutalist monochrome design system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${spaceGrotesk.variable}
        ${jetbrainsMono.variable}
        ${archivoBlack.variable}
      `}
    >
      <body>{children}</body>
    </html>
  );
}
