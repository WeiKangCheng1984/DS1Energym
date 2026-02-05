import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "電幻1號所 | Energym",
  description: "電幻1號所 Energym — 五款能源主題互動遊戲，水力、風力、光伏、波浪、地熱",
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
