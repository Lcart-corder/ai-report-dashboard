import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "おえかき金魚VR体験システム",
  description:
    "子どもたちの絵から生まれた金魚がVR空間で泳ぎ出す。AI解析×WebXR体験システム。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-b from-sky-50 to-cyan-50 text-gray-800">
        {/* ナビゲーションヘッダー */}
        <header className="sticky top-0 z-50 border-b border-cyan-200 bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-cyan-700"
            >
              🐟 おえかき金魚VR
            </Link>

            <ul className="flex items-center gap-6 text-sm font-medium">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-cyan-600"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="transition-colors hover:text-cyan-600"
                >
                  ギャラリー
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-cyan-600"
                >
                  管理
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
