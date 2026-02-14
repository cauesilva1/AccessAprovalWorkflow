import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internal Approval Workflow",
  description: "Sistema de fluxo de aprovação interna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
