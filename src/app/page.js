'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FloatingText from '@/components/FloatingText';
import BlackHole from '@/components/BlackHole';
import { getRemainingUses, getDailyLimit, canUse, useOneCredit, getResetTime, getHistoryCount } from '@/lib/usageTracker';

// Pre-generated star positions to avoid hydration mismatch
const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 23) % 100}%`,
    top: `${(i * 31 + 11) % 100}%`,
    size: 1 + (i % 3),
    opacity: 0.3 + ((i * 7) % 70) / 100,
    duration: 2 + (i % 3),
    delay: (i % 20) / 10
  }));
};

const STARS = generateStars(50);

export default function Home() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlackHole, setShowBlackHole] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [limit, setLimit] = useState(3);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [inputMode, setInputMode] = useState('screenshot'); // screenshot or text
  const [chatText, setChatText] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  // Loading messages for credibility illusion
  const loadingMessages = [
    `유사 대화 ${1000 + Math.floor(Math.random() * 500)}건 비교 중…`,
    "상대 반응 패턴 매칭 중…",
    "실수 포인트 검사 중…",
    "보내기 위험도 계산 중…"
  ];

  useEffect(() => {
    setMounted(true);
    setRemaining(getRemainingUses());
    setLimit(getDailyLimit());
    setHistoryCount(getHistoryCount());
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    setLoadingMessage(loadingMessages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = useCallback(async (file) => {
    if (!file) return;

    if (!canUse()) {
      setShowLimitModal(true);
      return;
    }

    useOneCredit();
    setRemaining(getRemainingUses());
    setIsLoading(true);
    setShowBlackHole(true);
  }, []);

  const handleBlackHoleEnd = useCallback(() => {
    router.push('/result');
  }, [router]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleAnalyze(file);
    }
  }, [handleAnalyze]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAnalyze(file);
    }
  }, [handleAnalyze]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDemoClick = useCallback(() => {
    if (!canUse()) {
      setShowLimitModal(true);
      return;
    }

    useOneCredit();
    setRemaining(getRemainingUses());
    setIsLoading(true);
    setShowBlackHole(true);
  }, []);

  const handleTextAnalyze = useCallback(() => {
    if (!chatText.trim()) {
      alert('대화 내용을 붙여넣어주세요!');
      return;
    }

    if (!canUse()) {
      setShowLimitModal(true);
      return;
    }

    useOneCredit();
    setRemaining(getRemainingUses());
    setIsLoading(true);
    setShowBlackHole(true);
    // In production, would send chatText to API
  }, [chatText]);

  return (
    <main className="main-container">
      {/* Background stars effect */}
      <div className="stars-container">
        {mounted && STARS.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Daily usage counter */}
      {mounted && !isLoading && (
        <div className="usage-counter">
          <div className="usage-badge">
            <span className="usage-icon">🎫</span>
            <span className="usage-text">오늘 무료 <strong>{remaining}</strong>/{limit}회</span>
          </div>
          {historyCount > 0 && (
            <div className="history-badge" onClick={() => alert('🔒 히스토리 기능 준비중!')}>
              <span>📋 내 판정 {historyCount}개</span>
            </div>
          )}
        </div>
      )}

      {/* Floating neon title */}
      {!isLoading && <FloatingText text="톡을 던져봐" subtext="Drop Here" />}

      {/* Input mode toggle */}
      {!isLoading && (
        <div className="input-mode-toggle">
          <button
            className={`mode-btn ${inputMode === 'screenshot' ? 'active' : ''}`}
            onClick={() => setInputMode('screenshot')}
          >
            📷 스크린샷
          </button>
          <button
            className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
          >
            📝 텍스트
          </button>
        </div>
      )}

      {/* Screenshot Upload zone */}
      {!isLoading && inputMode === 'screenshot' && (
        <div
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="file-upload"
          />
          <div className="upload-icon">📱</div>
          <div className="upload-text">카톡 스크린샷을 여기에 던져!</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.5 }}>
            또는 클릭해서 선택
          </div>
        </div>
      )}

      {/* Text paste zone */}
      {!isLoading && inputMode === 'text' && (
        <div className="text-input-zone">
          <textarea
            className="chat-textarea"
            placeholder="대화 내용을 복사해서 붙여넣기 해봐!&#10;&#10;예시:&#10;상대: 뭐해?&#10;나: 밥먹음&#10;상대: ㅋㅋ 뭐먹어&#10;나: 치킨..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
          />
          <button
            className="analyze-btn"
            onClick={handleTextAnalyze}
            disabled={!chatText.trim()}
          >
            🔥 분석하기
          </button>
          <div className="text-hint">
            💡 카톡에서 대화 선택 → 복사 → 여기에 붙여넣기
          </div>
        </div>
      )}

      {/* Demo button */}
      {!isLoading && (
        <button onClick={handleDemoClick} className="demo-btn">
          🎲 데모 체험하기
        </button>
      )}

      {/* Trust message - reduces bounce rate 20-30% */}
      {!isLoading && (
        <div className="trust-message">
          🔓 로그인 없이 바로 가능
        </div>
      )}

      {/* Loading state with rotating messages */}
      {isLoading && !showBlackHole && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-message">{loadingMessage}</div>
        </div>
      )}

      {/* Black hole animation */}
      <BlackHole isActive={showBlackHole} onAnimationEnd={handleBlackHoleEnd} />

      {/* Limit reached modal */}
      {showLimitModal && (
        <div className="limit-modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="limit-modal" onClick={e => e.stopPropagation()}>
            <div className="limit-emoji">🔒</div>
            <h2>오늘 무료 분석 다 씀</h2>
            <p className="limit-reason">지금은 고위험 멘트라 무료에선 숨김</p>
            <p className="limit-offer">공유하면 +1회 바로 지급함</p>

            <div className="limit-options">
              <button className="share-bonus-btn" onClick={() => {
                alert('공유하기 버튼 클릭하면 +1회 지급됨!');
                setShowLimitModal(false);
              }}>
                공유하고 +1 받기
              </button>
              <button className="close-btn" onClick={() => setShowLimitModal(false)}>
                내일 다시 하기
              </button>
            </div>
            <p className="limit-note">하루 최대 2회까지</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .usage-counter {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 50;
        }
        .usage-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 0, 153, 0.3);
          border-radius: 20px;
          padding: 8px 16px;
          backdrop-filter: blur(10px);
        }
        .usage-icon {
          font-size: 1.2rem;
        }
        .usage-text {
          font-size: 0.85rem;
          color: #fff;
        }
        .usage-text strong {
          color: #ff0099;
          font-size: 1.1rem;
        }
        .history-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 15px;
          padding: 6px 12px;
          font-size: 0.75rem;
          color: #ffd700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .history-badge:hover {
          background: rgba(255, 215, 0, 0.2);
        }
        .limit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(5px);
        }
        .limit-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #ff0099;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          max-width: 320px;
          box-shadow: 0 0 40px rgba(255, 0, 153, 0.3);
        }
        .limit-emoji {
          font-size: 4rem;
          margin-bottom: 10px;
        }
        .limit-modal h2 {
          color: #ff0099;
          margin-bottom: 10px;
        }
        .limit-modal p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 5px;
        }
        .reset-time {
          color: #ffd700;
          font-weight: bold;
          font-size: 1.1rem;
          margin: 15px 0;
        }
        .limit-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }
        .share-bonus-btn {
          background: linear-gradient(135deg, #39ff14, #00ff88);
          border: none;
          border-radius: 25px;
          padding: 15px 25px;
          color: #000;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .share-bonus-btn:hover {
          transform: scale(1.05);
        }
        .close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 10px 20px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }
        .input-mode-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          z-index: 10;
        }
        .mode-btn {
          padding: 10px 20px;
          border: 2px solid rgba(255, 0, 153, 0.3);
          border-radius: 25px;
          background: rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .mode-btn.active {
          border-color: #ff0099;
          color: #ff0099;
          background: rgba(255, 0, 153, 0.15);
        }
        .mode-btn:hover {
          border-color: #ff0099;
        }
        .text-input-zone {
          width: 85%;
          max-width: 450px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          z-index: 10;
        }
        .chat-textarea {
          width: 100%;
          height: 180px;
          padding: 15px;
          border: 2px solid rgba(255, 0, 153, 0.3);
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 0.95rem;
          line-height: 1.5;
          resize: none;
          outline: none;
          transition: border-color 0.3s;
        }
        .chat-textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .chat-textarea:focus {
          border-color: #ff0099;
        }
        .analyze-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 30px;
          background: linear-gradient(135deg, #ff0099, #ff6b9d);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(255, 0, 153, 0.4);
        }
        .analyze-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 0, 153, 0.6);
        }
        .analyze-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .text-hint {
          text-align: center;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .trust-message {
          margin-top: 20px;
          padding: 8px 16px;
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.3);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #39ff14;
          z-index: 10;
        }
        .loading-message {
          color: var(--neon-pink);
          font-size: 1rem;
          animation: fadeInOut 1.2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(5px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>
    </main>
  );
}
