import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
});

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
    <html lang="pl">
      <body className={`${sourceSans.variable} font-sans antialiased`}>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
