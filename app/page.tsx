import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SubscribeForm } from '@/components/SubscribeForm';

export default function LandingPage() {
  const kakaoChannelUrl = process.env.KAKAO_CHANNEL_URL || '#';
  const youtubeChannelUrl = process.env.YOUTUBE_CHANNEL_URL || '#';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          매일 5분,
          <br />
          글로벌 이슈의{' '}
          <span className="text-primary underline decoration-wavy">
            인센티브 번역
          </span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          팩트는 건조하게, 해석은 재밌게.
          <br />
          &quot;누가 웃고 누가 우는가&quot; 관점으로 글로벌 경제/테크 뉴스를
          해설합니다.
        </p>

        <div className="flex flex-col items-center gap-4 mb-12">
          <SubscribeForm sourceUtm="landing" />
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a
                href={kakaoChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                카톡 채널 추가
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                유튜브 채널
              </a>
            </Button>
          </div>
        </div>

        <Button size="lg" asChild>
          <Link href="/feed">오늘의 인사이트 보기</Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            이렇게 읽습니다
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="font-semibold mb-2">FACT</h3>
              <p className="text-sm text-muted-foreground">
                기사 핵심을 3~5개 bullet으로 요약
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold mb-2">ANALYSIS</h3>
              <p className="text-sm text-muted-foreground">
                누가 웃고 누가 우는지, 시나리오 2개로 해설
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">CHECKPOINTS</h3>
              <p className="text-sm text-muted-foreground">
                앞으로 확인할 이벤트와 지표
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} News Insights. 관점 기반 분석이며
          투자 조언이 아닙니다.
        </p>
      </footer>
    </div>
  );
}
