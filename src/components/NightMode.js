'use client';

import { useState, useEffect } from 'react';

// Check if it's "risky" late night hours (11PM - 5AM)
export function isNightMode() {
    const hour = new Date().getHours();
    return hour >= 23 || hour < 5;
}

export function getNightModeMessage() {
    const messages = [
        "🌙 새벽모드 ON - 이 시간엔 판단력 떨어짐. 대신 내가 잘잘이 걸러줌",
        "⚠️ 심야판정 - 오늘은 성공보다 '망하지 않기'가 우선임",
        "🔒 블랙박스 모드 - 실수 방지 뒤양스 켜짐"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

export function getTimingSuggestion() {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 7) {
        return {
            warning: true,
            message: "⏰ 지금 보내지 말고 오전 10시 이후에 보내는 게 나음",
            reason: "새벽 문자는 '급해보임' + '술먹음?' 느낌 줌"
        };
    }
    if (hour >= 23) {
        return {
            warning: true,
            message: "⏰ 내일 아침에 보내면 '여유있어 보임' 효과",
            reason: "밤 11시 이후 = 부담스러울 확률 높음"
        };
    }
    return null;
}

// Night Mode Banner Component
export default function NightModeBanner() {
    const [isNight, setIsNight] = useState(false);
    const [message, setMessage] = useState('');
    const [timing, setTiming] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setIsNight(isNightMode());
        setMessage(getNightModeMessage());
        setTiming(getTimingSuggestion());
    }, []);

    if (!isNight || dismissed) return null;

    return (
        <div className="night-mode-banner">
            <div className="night-content">
                <div className="night-message">{message}</div>
                {timing && (
                    <div className="timing-warning">
                        <span className="timing-icon">⚡</span>
                        <span>{timing.message}</span>
                    </div>
                )}
            </div>
            <button className="dismiss-btn" onClick={() => setDismissed(true)}>✕</button>

            <style jsx>{`
        .night-mode-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%);
          border-bottom: 2px solid #9b59b6;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 60;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .night-content {
          flex: 1;
        }
        .night-message {
          font-size: 0.9rem;
          color: #e8daef;
          font-weight: 500;
        }
        .timing-warning {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 0.8rem;
          color: #ffd700;
        }
        .timing-icon {
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .dismiss-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
        }
        .dismiss-btn:hover {
          color: white;
        }
      `}</style>
        </div>
    );
}

// Risk Label Component for messages
export function RiskLabel({ level }) {
    const labels = {
        safe: { icon: '👍', text: '안전', color: '#39ff14' },
        flirt: { icon: '😈', text: '도발', color: '#9b59b6' },
        push: { icon: '💬', text: '밀당', color: '#3498db' },
        risky: { icon: '⚠️', text: '리스크', color: '#f39c12' },
        danger: { icon: '🔥', text: '고위험', color: '#e74c3c' }
    };

    const label = labels[level] || labels.safe;

    return (
        <span className="risk-label" style={{ '--label-color': label.color }}>
            <span className="risk-icon">{label.icon}</span>
            <span className="risk-text">{label.text}</span>

            <style jsx>{`
        .risk-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--label-color);
          border-radius: 12px;
          font-size: 0.75rem;
          color: var(--label-color);
        }
        .risk-text {
          font-weight: 600;
        }
      `}</style>
        </span>
    );
}

// Safe Alternative Suggestion
export function SafeAlternative({ original, safe, onUseSafe }) {
    return (
        <div className="safe-alternative">
            <div className="alt-header">
                <span className="alt-icon">🛡️</span>
                <span>더 안전한 버전</span>
            </div>
            <div className="alt-comparison">
                <div className="original">
                    <span className="label">원본</span>
                    <p>{original}</p>
                </div>
                <div className="arrow">→</div>
                <div className="safe">
                    <span className="label">안전</span>
                    <p>{safe}</p>
                </div>
            </div>
            <button className="use-safe-btn" onClick={() => onUseSafe?.(safe)}>
                안전 버전 복사하기
            </button>

            <style jsx>{`
        .safe-alternative {
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.3);
          border-radius: 12px;
          padding: 15px;
          margin-top: 15px;
        }
        .alt-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #39ff14;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .alt-comparison {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }
        .original, .safe {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
        }
        .original {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.2);
        }
        .safe {
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.2);
        }
        .label {
          font-size: 0.7rem;
          text-transform: uppercase;
          opacity: 0.6;
        }
        .original p, .safe p {
          margin: 5px 0 0;
          color: #fff;
        }
        .arrow {
          color: #39ff14;
          font-size: 1.2rem;
        }
        .use-safe-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, #39ff14, #00ff88);
          border: none;
          border-radius: 20px;
          color: #000;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .use-safe-btn:hover {
          transform: scale(1.02);
        }
      `}</style>
        </div>
    );
}
