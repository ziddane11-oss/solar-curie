'use client';

import { useState, useCallback } from 'react';

const CARD_TYPES = {
  flirt: { icon: '🔥', label: '유혹', color: '#ff6b6b', bgColor: 'rgba(255, 107, 107, 0.15)' },
  tease: { icon: '😈', label: '도발', color: '#9b59b6', bgColor: 'rgba(155, 89, 182, 0.15)' },
  sweet: { icon: '💕', label: '설렘', color: '#ff0099', bgColor: 'rgba(255, 0, 153, 0.15)' },
  cold: { icon: '❄️', label: '손절', color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.15)' }
};

// Updated risk labels with descriptions
const RISK_LEVELS = {
  safe: { icon: '👍', label: '안전', desc: '부담 최소', color: '#39ff14' },
  push: { icon: '🧊', label: '밀당', desc: '여운 남김', color: '#00d4ff' },
  medium: { icon: '😈', label: '도발', desc: '반응 유도', color: '#9b59b6' },
  risky: { icon: '⚠️', label: '리스크', desc: '읽씹 가능', color: '#f39c12' },
  high: { icon: '🔥', label: '고위험', desc: '관계 흔들림', color: '#ff4444' }
};

export default function ActionCard({ type = 'flirt', message, risk = 'safe', locked = false, onCopy }) {
  const [copied, setCopied] = useState(false);
  const cardStyle = CARD_TYPES[type] || CARD_TYPES.flirt;
  const riskInfo = RISK_LEVELS[risk] || RISK_LEVELS.safe;

  const handleClick = useCallback(() => {
    if (locked) {
      // Show share prompt instead of payment
      alert('🔒 공유하면 잠금 해제됨!');
      return;
    }

    navigator.clipboard?.writeText(message);
    setCopied(true);
    onCopy?.(message);

    setTimeout(() => setCopied(false), 2000);
  }, [message, onCopy, locked]);

  // Locked card with special copy
  if (locked) {
    return (
      <div className="action-card locked" onClick={handleClick}>
        <div className="locked-overlay">
          <div className="lock-icon">🔒</div>
          <div className="lock-title">흐름 뒤집는 한 문장</div>
          <div className="lock-subtitle">이 상황에서 제일 흔한 실수 피하게 해줌</div>
          <button className="unlock-btn">열어보기</button>
        </div>

        <style jsx>{`
          .action-card.locked {
            background: rgba(30, 30, 40, 0.8);
            border: 2px dashed rgba(255, 215, 0, 0.4);
            border-radius: 16px;
            padding: 20px;
            cursor: pointer;
            min-width: 200px;
            max-width: 320px;
            width: 100%;
            position: relative;
            overflow: hidden;
          }
          .action-card.locked::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 40%, rgba(255,215,0,0.05) 50%, transparent 60%);
            animation: shimmer 2s infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .locked-overlay {
            text-align: center;
            position: relative;
            z-index: 1;
          }
          .lock-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          .lock-title {
            font-size: 1rem;
            font-weight: 700;
            color: #ffd700;
            margin-bottom: 6px;
          }
          .lock-subtitle {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 15px;
          }
          .unlock-btn {
            background: linear-gradient(135deg, #ffd700, #ffaa00);
            border: none;
            border-radius: 20px;
            padding: 10px 25px;
            color: #000;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .unlock-btn:hover {
            transform: scale(1.05);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="action-card"
      onClick={handleClick}
      style={{
        '--card-color': cardStyle.color,
        '--card-bg': cardStyle.bgColor
      }}
    >
      <div className="card-header">
        <div className="card-type">
          <span className="card-icon">{cardStyle.icon}</span>
          <span className="card-label">{cardStyle.label}</span>
        </div>
        <div className="risk-badge" style={{ borderColor: riskInfo.color, color: riskInfo.color }}>
          <span>{riskInfo.icon}</span>
          <span className="risk-label">{riskInfo.label}</span>
        </div>
      </div>

      <p className="card-message">{message}</p>

      <div className="card-footer">
        <span className="risk-desc" style={{ color: riskInfo.color }}>{riskInfo.desc}</span>
        {copied ? (
          <span className="copied-text">✓ 복사됨!</span>
        ) : (
          <span className="copy-hint">탭하여 복사</span>
        )}
      </div>

      <style jsx>{`
        .action-card {
          background: var(--card-bg);
          border: 1px solid var(--card-color);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
          max-width: 320px;
          width: 100%;
        }
        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .action-card:active {
          transform: scale(0.98);
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .card-type {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-icon {
          font-size: 1.1rem;
        }
        .card-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--card-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .risk-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid;
          border-radius: 12px;
        }
        .risk-label {
          font-weight: 600;
        }
        .card-message {
          font-size: 1rem;
          color: #fff;
          line-height: 1.5;
          margin: 0;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          font-size: 0.75rem;
        }
        .risk-desc {
          font-weight: 500;
        }
        .copy-hint {
          color: rgba(255, 255, 255, 0.4);
        }
        .copied-text {
          color: #39ff14;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
