import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const sourceSans = Source_Sans_3({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Fizjo",
  description: "Dokumentacja wizyt w gabinecie fizjoterapii",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={sourceSans.className}>
      <body className="antialiased">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
