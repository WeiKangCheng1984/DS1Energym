import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "觸感小宇宙 | Touch Cosmos",
  description: "Touch Cosmos 觸感小宇宙 — 16 種紓壓特效，點擊即觸發",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen antialiased touch-manipulation">
        {children}
      </body>
    </html>
  );
}
