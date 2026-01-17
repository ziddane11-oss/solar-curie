import './globals.css';
import Script from 'next/script';

const GA_ID = 'G-WQ190R9RTX';

export const metadata = {
  title: '톡캐디 GRAVITY | 이성은 무너지고, 본능만 남는다',
  description: '카톡 대화를 던지면 결과가 쏟아진다. 물리 법칙으로 분석하는 연애 감정 분석기.',
  keywords: ['카톡분석', '연애', '썸', 'MBTI', '심리테스트'],
  openGraph: {
    title: '톡캐디 GRAVITY',
    description: '이성은 무너지고, 본능만 남는다. 🌙',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        {/* GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
