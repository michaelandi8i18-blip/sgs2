import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SGS - SPGE Groundcheck System",
  description: "Sistem Pemeriksaan Kualitas Kelapa Sawit - Ground Check untuk QC Buah, Agronomy, dan Quality Assurance",
  keywords: ["SGS", "SPGE", "Groundcheck", "Kelapa Sawit", "Palm Oil", "QC Buah", "Quality Control", "Indonesia"],
  authors: [{ name: "SPGE Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SGS - SPGE Groundcheck System",
    description: "Sistem Pemeriksaan Kualitas Kelapa Sawit",
    url: "https://sgs2-tau.vercel.app",
    siteName: "SGS",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "SGS - SPGE Groundcheck System",
    description: "Sistem Pemeriksaan Kualitas Kelapa Sawit",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌴</text></svg>" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
