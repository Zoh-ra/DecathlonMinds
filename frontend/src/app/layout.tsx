import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import "../styles/pillButton.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  title: "DecathlonMinds",
  description: "Application pour la santé mentale par le mouvement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'ITC Avant Garde Gothic Std';
            src: url('/fonts/ITCAvantGardeStd-Md.woff2') format('woff2'),
                url('/fonts/ITCAvantGardeStd-Md.woff') format('woff');
            font-weight: 500;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'ITC Avant Garde Gothic Std';
            src: url('/fonts/ITCAvantGardeStd-Bk.woff2') format('woff2'),
                url('/fonts/ITCAvantGardeStd-Bk.woff') format('woff');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          :root {
            --font-avantgarde: 'ITC Avant Garde Gothic Std';
          }
          
          /* Supprimer toutes les bordures violettes */
          .chatbot, .chatbotContainer, main div {
            outline: none !important;
            border-image: none !important;
          }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}>
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
            </filter>
            <filter id="drawing">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
