import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFinance - Controle Financeiro por Voz",
  description: "Controle suas finanças usando comando de voz",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFinance",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
