import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'News Insights - 글로벌 이슈의 인센티브 번역',
  description: '매일 5분, 글로벌 경제/테크 뉴스의 팩트와 관점 해설',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <header className="border-b">
          <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">
              News Insights
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/feed"
                className="text-muted-foreground hover:text-foreground"
              >
                피드
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
