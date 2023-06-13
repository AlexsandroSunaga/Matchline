import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";

const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ACME Record Match",
  description: "Entity resolution console — portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dm.variable} ${mono.variable}`}>
      <body className="theme-record antialiased min-h-screen paper-bg">{children}</body>
    </html>
  );
}
