import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Eldora Realms | NFT Play-to-Earn",
  description:
    "Jogo NFT Play-to-Earn com farming automatizado, anúncios recompensados e economia baseada em GOLD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-semibold tracking-wide">
                Eldora Realms
              </Link>
              <nav className="flex gap-4 text-sm uppercase tracking-widest">
                <Link href="/dashboard" className="hover:text-amber-400 transition">
                  Player Hub
                </Link>
                <Link href="/admin" className="hover:text-emerald-400 transition">
                  Painel Admin
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800 bg-slate-950/80">
            <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-400 flex justify-between">
              <span>&copy; {new Date().getFullYear()} Eldora Realms</span>
              <span>Economia GOLD • Integrado com anúncios recompensados</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
