import './globals.css';

export const metadata = {
  title: '지원서도우미',
  description: '원서 자동 작성 · PDF 출력',
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
