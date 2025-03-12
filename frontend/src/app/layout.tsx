import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

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
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
