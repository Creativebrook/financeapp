import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { FinanceProvider } from "@/context/FinanceContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finance 360º - Gestão Financeira Pessoal",
  description: "Sistema Pessoal de Gestão Financeira 360º - Dashboard completo para controlo das suas finanças",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <SidebarProvider>
          <FinanceProvider>
            {children}
          </FinanceProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
