'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SpeedGauge from '@/components/SpeedGauge';
import ActionCard from '@/components/ActionCard';
import InsightBox from '@/components/InsightBox';
import Confetti from '@/components/Confetti';

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
            { type: 'flirt', message: '혼자 먹으면 맛없는데... 우리 집으로 시킬까?' },
            { type: 'tease', message: '사주는 건 쉬운데 넌 뭐 해줄 건데?😏' },
            { type: 'sweet', message: '마침 나도 단 거 땡겼어! 어디서 볼까?' }
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
            { type: 'cold', message: '바쁜가보네~ 나중에 연락해!' },
            { type: 'tease', message: '답장 그렇게 하면 재미없는 사람 돼요~' },
            { type: 'cold', message: '(읽고 씹기)' }
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

    const handleShare = useCallback(async () => {
        if (!result) return;

        const shareText = `🔥 톡캐디 GRAVITY 분석 결과 🔥

내 썸 온도: ${result.score}%
판정: ${result.verdict === 'GO' ? '🟢 GO - 게임 끝!' : '🔴 STOP - 그만해...'}

${result.verdictMessage}

👉 너도 해봐: ${window.location.origin}`;

        // Try Web Share API first (works on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '톡캐디 GRAVITY',
                    text: shareText
                });
                return;
            } catch (err) {
                // User cancelled or share failed, fall through to clipboard
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            setToastMessage('📋 클립보드에 복사됨! 카톡에 붙여넣기 해봐!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            // Final fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setToastMessage('📋 복사 완료!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
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

            {/* Content overlay */}
            <div className="result-content">
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
                            {result.actionCards.map((card, i) => (
                                <ActionCard
                                    key={i}
                                    type={card.type}
                                    message={card.message}
                                    onCopy={handleCopy}
                                />
                            ))}
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

            {/* Toast notification */}
            {showToast && (
                <div className="toast-notification">
                    {toastMessage}
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
      `}</style>
        </main>
    );
}
