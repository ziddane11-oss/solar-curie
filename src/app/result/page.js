'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SpeedGauge from '@/components/SpeedGauge';
import ActionCard from '@/components/ActionCard';
import InsightBox from '@/components/InsightBox';
import Confetti from '@/components/Confetti';
import LoginModal from '@/components/LoginModal';
import NightModeBanner from '@/components/NightMode';
import { grantShareBonus, getFreeLeft } from '@/lib/usageTracker';
import { addHistory, createHistoryItem } from '@/lib/history';
import { maybePromptLogin } from '@/lib/useCounter';
import { isNightKst, shouldLockAction } from '@/lib/nightMode';
import { trackResultView, trackActionCopy, trackLockedActionClick, trackShareSuccess, trackShareRewardGranted } from '@/lib/analytics';
import { saveShareCardPng, buildStoryCaption } from '@/lib/share';
import { shouldShowInstaGuide, markInstaGuideShown } from '@/lib/instaGuide';

// Dynamic import to avoid SSR issues with Matter.js
const PhysicsWorld = dynamic(() => import('@/components/PhysicsWorld'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000'
    }}>
      <div className="loading-spinner" />
    </div>
  )
});

// Mock analysis results for MVP demo
const mockResults = {
  hot: {
    score: 75 + Math.floor(Math.random() * 20), // 75-95%
    type: 'hot',
    verdict: 'GO',
    verdictMessage: '게임 끝. 당장 만나자고 해.',
    keywords: [
      { text: '적극적', type: 'bubble', sentiment: 'positive' },
      { text: '관심폭발', type: 'bubble', sentiment: 'positive' },
      { text: '오늘각', type: 'bubble', sentiment: 'positive' },
      { text: '설렘가득', type: 'bubble', sentiment: 'positive' },
      { text: '유혹중', type: 'bubble', sentiment: 'positive' },
    ],
    insight: {
      persona: '카사노바',
      text: '상대방은 디저트를 핑계로 너랑 술 마시고 싶은 거임. 눈치 좀 챙겨.',
      before: '디저트 먹고 싶다~',
      after: '너랑 더 시간 보내고 싶어'
    },
    actionCards: [
      { type: 'flirt', message: '혼자 먹으면 맛없는데... 우리 집으로 시킬까?', risk: 'high' },
      { type: 'tease', message: '사주는 건 쉬운데 넌 뭐 해줄 건데?😏', risk: 'medium' },
      { type: 'sweet', message: '마침 나도 단 거 땡겼어! 어디서 볼까?', risk: 'safe' }
    ]
  },
  cold: {
    score: 10 + Math.floor(Math.random() * 25), // 10-35%
    type: 'cold',
    verdict: 'STOP',
    verdictMessage: '오늘 밤은 혼자 자라.',
    keywords: [
      { text: '읽씹', type: 'brick', sentiment: 'negative' },
      { text: '철벽', type: 'brick', sentiment: 'negative' },
      { text: '어장관리', type: 'brick', sentiment: 'negative' },
      { text: 'ㅋ', type: 'brick', sentiment: 'negative' },
      { text: '바쁨', type: 'brick', sentiment: 'negative' },
    ],
    insight: {
      persona: '독설가',
      text: '이건 관심 없다는 거야. 1글자 답장은 "꺼져"의 다른 표현임.',
      before: 'ㅇㅇ ㅋ',
      after: '관심없어 그만해'
    },
    actionCards: [
      { type: 'cold', message: '바쁜가보네~ 나중에 연락해!', risk: 'safe' },
      { type: 'tease', message: '답장 그렇게 하면 재미없는 사람 돼요~', risk: 'medium' },
      { type: 'cold', message: '(읽고 씹기)', risk: 'high', locked: true }
    ]
  }
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [objects, setObjects] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('verdict');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [showInstaGuide, setShowInstaGuide] = useState(false);

  useEffect(() => {
    // Randomly select hot or cold result for demo
    const isHot = Math.random() > 0.35;
    const selectedResult = isHot ? { ...mockResults.hot } : { ...mockResults.cold };

    // Recalculate score for this instance
    selectedResult.score = isHot
      ? 75 + Math.floor(Math.random() * 20)
      : 10 + Math.floor(Math.random() * 25);

    // Add unique IDs to keywords
    const objectsWithIds = selectedResult.keywords.map((k, i) => ({
      ...k,
      id: `obj-${i}-${Date.now()}`
    }));

    setResult(selectedResult);

    // Check night mode
    setIsNight(isNightKst());

    // Save to history
    const historyItem = createHistoryItem(selectedResult);
    addHistory(historyItem);

    // Track analytics
    trackResultView(selectedResult.score, selectedResult.verdict);

    // Maybe show login modal (3rd/6th use)
    maybePromptLogin(() => {
      setTimeout(() => setShowLoginModal(true), 2000);
    });

    // Trigger confetti for hot results
    if (isHot) {
      setTimeout(() => setShowConfetti(true), 800);
    }

    // Stagger the object drops
    setTimeout(() => {
      setObjects(objectsWithIds);
    }, 500);
  }, []);

  const handleObjectClick = useCallback((objectData, body) => {
    console.log('Clicked:', objectData);
  }, []);

  const handleObjectPop = useCallback((objectData) => {
    // Pop action
  }, []);

  const handleCopy = useCallback((message) => {
    setToastMessage(`"${message.slice(0, 20)}..." 복사됨!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  const handleReset = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleShare = useCallback(async (from = 'button') => {
    if (!result) return;

    // Track share click
    trackShareSuccess();

    // Viral share text
    const shareText = `오늘 밤 성공확률 ${result.score}%… 너라면 뭐 보냄?

${result.verdict === 'GO' ? '🟢 GO!' : '🔴 STOP'} - ${result.verdictMessage}

👉 톡캐디 GRAVITY
${typeof window !== 'undefined' ? window.location.origin : 'https://solar-curie.vercel.app'}/result-preview?c=${result.score}&v=${result.verdict}
#톡캐디 #딸깍연애단`;

    let shared = false;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '톡캐디 판정서',
          text: shareText
        });
        shared = true;
      } catch (err) {
        // User cancelled, try clipboard
      }
    }

    // Fallback: Copy to clipboard
    if (!shared) {
      try {
        await navigator.clipboard.writeText(shareText);
        shared = true;
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        shared = true;
      }
    }

    if (shared) {
      // Grant share bonus
      const bonusGranted = grantShareBonus();
      if (bonusGranted) {
        trackShareRewardGranted(getFreeLeft());
        setToastMessage(`🎁 공유 보상 +1회 지급됨! (남은 무료 ${getFreeLeft()}회)`);
      } else {
        setToastMessage('📋 공유 완료! (오늘 보상 한도 도달)');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [result]);

  // 인스타 스토리 저장
  const handleInstaSave = useCallback(async () => {
    if (!result) return;

    const r = await saveShareCardPng();
    if (!r.ok) {
      setToastMessage('❌ 저장 실패 - 다시 시도해주세요');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 스토리 캡션 + 링크 자동 복사
    const caption = buildStoryCaption(result);
    const shareUrl = `https://solar-curie.vercel.app/result-preview?c=${result.score}&v=${result.verdict}`;
    const clipboardText = `${caption}\n\n👉 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(clipboardText);
    } catch { }

    // 저장도 공유 보상 지급
    const rewarded = grantShareBonus();
    const left = getFreeLeft();

    if (rewarded) {
      trackShareRewardGranted(left);
      setToastMessage(`🎁 저장 완료! +1회 📋 링크도 복사됨!`);
    } else {
      setToastMessage('📸 저장 완료! 📋 링크 복사됨 - 스티커에 붙여넣기!');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    // 1회만 인스타 가이드 표시
    if (shouldShowInstaGuide()) {
      setTimeout(() => setShowInstaGuide(true), 500);
      markInstaGuideShown();
    }
  }, [result]);

  if (!result) {
    return (
      <main className="main-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <div style={{ color: 'var(--neon-pink)', marginTop: '1rem' }}>
            분석 중...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="result-main">
      {/* Physics world background */}
      <PhysicsWorld
        objects={objects}
        gravityType={result.type === 'hot' ? 'anti' : 'normal'}
        onObjectClick={handleObjectClick}
        onObjectPop={handleObjectPop}
      />

      {/* Confetti celebration for hot results */}
      <Confetti isActive={showConfetti} type={result.type === 'hot' ? 'success' : 'fail'} />

      {/* Night mode warning banner */}
      <NightModeBanner />

      {/* Login modal for 3rd/6th use */}
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Content overlay */}
      <div className="result-content">
        {/* 인스타/공유용 캡처 카드 - 9:16 스토리 캔버스 */}
        <div id="share-card" className="story-canvas">
          <div className="canvas-hint-top">AI가 판단한 오늘 밤 흐름</div>
          <div className={`share-card-inner ${result.verdict === 'GO' ? 'go-anim' : 'stop-anim'}`}>
            <div className="share-card-header">
              <span>톡캐디 판정서</span>
              <span className="header-right">
                {isNight && <span className="badge-night">🌙 심야 생존자</span>}
                {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>

            <div className="share-card-main">
              <div className="share-score">
                <span className="score-number">{result.score}%</span>
                <span className="score-label">유사 대화 기준</span>
              </div>
              <div className="share-verdict">
                <span className={`verdict-badge ${result.verdict === 'GO' ? 'go' : 'stop'}`}>
                  {result.verdict === 'GO' ? 'GO 🔥' : 'STOP 🛑'}
                </span>
                <span className="verdict-sub">{result.verdict === 'GO' ? '밀어붙여' : '그만해'}</span>
              </div>
            </div>

            <div className="share-card-roast">
              <span className="roast-label">독설</span>
              <p>{result.insight?.text || result.verdictMessage}</p>
            </div>

            <div className="share-card-footer">
              <span>talkcaddy</span>
              <span>solar-curie.vercel.app</span>
            </div>
            <div className="story-hint">⬆ 링크는 스토리 상단에 있음</div>
          </div>
          <div className="canvas-hint-bottom">지금 답장 하나로 결과가 바뀜</div>
        </div>

        {/* Speed Gauge */}
        <SpeedGauge score={result.score} verdict={result.verdict} />

        {/* Verdict message */}
        <p className="verdict-message">{result.verdictMessage}</p>

        {/* Tab navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'verdict' ? 'active' : ''}`}
            onClick={() => setActiveTab('verdict')}
          >
            🎯 판정
          </button>
          <button
            className={`tab-btn ${activeTab === 'insight' ? 'active' : ''}`}
            onClick={() => setActiveTab('insight')}
          >
            🎭 독설
          </button>
          <button
            className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            💬 액션
          </button>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'verdict' && (
            <div className="keywords-grid">
              {result.keywords.map((k, i) => (
                <span
                  key={i}
                  className={`keyword-tag ${k.sentiment}`}
                >
                  {k.text}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'insight' && (
            <InsightBox
              persona={result.insight.persona}
              insight={result.insight.text}
              beforeText={result.insight.before}
              afterText={result.insight.after}
            />
          )}

          {activeTab === 'cards' && (
            <div className="cards-grid">
              {result.actionCards.map((card, i) => {
                // 밤 + 고위험 = 잠금
                const shouldLock = card.locked || (isNight && card.risk === 'high');
                return (
                  <ActionCard
                    key={i}
                    type={card.type}
                    message={card.message}
                    risk={card.risk}
                    locked={shouldLock}
                    onCopy={handleCopy}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="action-btn secondary" onClick={handleReset}>
          🔄 다시하기
        </button>
        <button className="action-btn primary" onClick={handleShare}>
          📤 공유하기
        </button>
      </div>

      {/* History saved feedback */}
      <div className="history-saved">
        ✅ 보관함에 저장됨
      </div>

      {/* Sticky CTA bar (bottom fixed) - 3 buttons */}
      <div className="sticky-cta-bar">
        <button className="cta-share-btn" onClick={() => handleShare('sticky_bar')}>
          🎉 자랑하기 +1
        </button>
        <button className="cta-insta-btn" onClick={handleInstaSave}>
          📸 스토리 올리기
        </button>
        <button className="cta-retry-btn" onClick={handleReset}>
          🔄
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {/* 인스타 스토리 가이드 (1회만) - 링크 스티커 강조 */}
      {showInstaGuide && (
        <div className="insta-guide-overlay" onClick={() => setShowInstaGuide(false)}>
          <div className="insta-guide-modal" onClick={e => e.stopPropagation()}>
            <div className="guide-title">📸 스토리 저장됨!</div>
            <div className="guide-warning">⚠️ 중요</div>
            <div className="guide-content">
              인스타 스토리에 올린 뒤<br />
              👉 상단 <b>'링크' 스티커</b> 꼭 추가해야<br />
              친구들이 눌러서 들어옴
            </div>
            <div className="guide-example">
              (스티커 문구 예: "AI 판정 보러가기")
            </div>
            <button className="guide-btn" onClick={() => setShowInstaGuide(false)}>
              확인했어
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .result-main {
          min-height: 100vh;
          background: #000;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          padding-bottom: 120px;
        }
        .result-content {
          position: relative;
          z-index: 10;
          padding: 20px;
          padding-top: 30px;
          padding-bottom: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .verdict-message {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin: 10px 0 25px;
          font-style: italic;
        }
        .tab-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .tab-btn {
          padding: 10px 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        .tab-btn.active {
          background: rgba(255, 0, 153, 0.2);
          border-color: #ff0099;
          color: #ff0099;
        }
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .tab-content {
          width: 100%;
          max-width: 500px;
          padding-bottom: 20px;
        }
        .keywords-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .keyword-tag {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .keyword-tag.positive {
          background: rgba(255, 0, 153, 0.2);
          color: #ff0099;
          border: 1px solid #ff0099;
        }
        .keyword-tag.negative {
          background: rgba(100, 100, 100, 0.2);
          color: #888;
          border: 1px solid #555;
        }
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
          padding-bottom: 30px;
        }
        .toast-notification {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--neon-pink);
          color: white;
          padding: 15px 30px;
          border-radius: 30px;
          font-size: 1rem;
          font-weight: 600;
          z-index: 200;
          box-shadow: 0 0 30px rgba(255, 0, 153, 0.6);
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .history-saved {
          margin-top: 15px;
          font-size: 0.85rem;
          color: #39ff14;
          opacity: 0.8;
        }
        .sticky-cta-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 0, 153, 0.3);
          display: flex;
          gap: 10px;
          max-width: 100%;
        }
        .cta-share-btn {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 25px;
          background: linear-gradient(135deg, #ff0099, #ff6b9d);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .cta-share-btn:hover {
          transform: scale(1.02);
        }
        .cta-retry-btn {
          width: 100px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }
        .cta-insta-btn {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 25px;
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .cta-insta-btn:hover {
          transform: scale(1.02);
        }
        .cta-retry-btn {
          width: 60px;
          padding: 16px;
          font-size: 1.2rem;
        }
        /* Story Canvas - 9:16 ratio for Instagram Story */
        .story-canvas {
          width: 100%;
          max-width: 360px;
          aspect-ratio: 9 / 16;
          margin: 0 auto 20px;
          padding: 30px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background: radial-gradient(circle at 30% 20%, rgba(255,0,150,0.35), rgba(0,0,0,0.95) 55%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .canvas-hint-top, .canvas-hint-bottom {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          text-align: center;
        }
        .canvas-hint-bottom {
          font-weight: 500;
          color: rgba(255,255,255,0.6);
        }
        .share-card-inner {
          width: 100%;
          padding: 20px;
          background: rgba(0,0,0,0.4);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 rgba(57,255,20,0.0); }
          50% { box-shadow: 0 0 35px rgba(57,255,20,0.4); }
          100% { box-shadow: 0 0 0 rgba(57,255,20,0.0); }
        }
        @keyframes stopShake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
        .go-anim {
          animation: pulseGlow 2.4s ease-in-out infinite;
        }
        .stop-anim {
          animation: stopShake 0.5s ease-in-out 1;
        }
        .share-card-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          margin-bottom: 15px;
        }
        .share-card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 15px;
        }
        .share-score .score-number {
          font-size: 3.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff0099, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .share-score .score-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }
        .share-verdict {
          text-align: right;
        }
        .verdict-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 1.2rem;
          font-weight: 800;
        }
        .verdict-badge.go {
          background: rgba(57, 255, 20, 0.2);
          color: #39ff14;
        }
        .verdict-badge.stop {
          background: rgba(255, 0, 0, 0.2);
          color: #ff4444;
        }
        .verdict-sub {
          display: block;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          margin-top: 5px;
        }
        .share-card-roast {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .roast-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 5px;
        }
        .share-card-roast p {
          margin: 0;
          font-size: 0.95rem;
          color: white;
          line-height: 1.4;
        }
        .share-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge-night {
          font-size: 0.7rem;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .insta-guide-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .insta-guide-modal {
          width: 100%;
          max-width: 320px;
          background: white;
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          color: #000;
        }
        .guide-title {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .guide-content {
          margin-top: 12px;
          font-size: 0.9rem;
          opacity: 0.8;
          line-height: 1.5;
        }
        .guide-warning {
          margin-top: 10px;
          color: #ff6b6b;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .guide-example {
          margin-top: 10px;
          font-size: 0.8rem;
          opacity: 0.6;
        }
        .story-hint {
          margin-top: 12px;
          text-align: center;
          font-size: 0.75rem;
          opacity: 0.6;
        }
        .guide-btn {
          margin-top: 20px;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ff0099, #ff6b9d);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
