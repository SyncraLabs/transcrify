
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Transcrify | Transcripción de Video a Texto con IA",
  description: "Convierte videos de YouTube, TikTok y más en texto perfectamente formateado al instante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-black text-white antialiased")}>
        {children}
      </body>
    </html>
  );
}
