import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Netas Academy",
  description: "Course, event, teacher, and editorial portal for Netas Academy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={cn(
        "dark h-full bg-background antialiased font-sans",
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <div className="min-h-screen overflow-x-hidden">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
