import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "やとアカ運営 AI-PMOシステム",
  description:
    "やとアカの理事・スタッフ向け AI支援型プロジェクト・業務管理システム（試作版）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
