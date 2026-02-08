import './globals.css';

export const metadata = {
  title: '기간제 교사 지원서 자동 생성기',
  description: '한글 양식 업로드 → 자동 채움 → PDF 다운로드',
  keywords: ['한글', 'HWP', 'HWPX', '지원서', 'PDF'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
