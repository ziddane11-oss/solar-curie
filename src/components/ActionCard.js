'use client';

import { useState, useCallback } from 'react';

const CARD_TYPES = {
  flirt: {
    icon: '🔥',
    label: '유혹',
    color: '#ff6b6b',
    bgColor: 'rgba(255, 107, 107, 0.15)'
  },
  tease: {
    icon: '😈',
    label: '도발',
    color: '#9b59b6',
    bgColor: 'rgba(155, 89, 182, 0.15)'
  },
  sweet: {
    icon: '💕',
    label: '설렘',
    color: '#ff0099',
    bgColor: 'rgba(255, 0, 153, 0.15)'
  },
  cold: {
    icon: '❄️',
    label: '손절',
    color: '#3498db',
    bgColor: 'rgba(52, 152, 219, 0.15)'
  }
};

const RISK_LEVELS = {
  safe: { icon: '👍', label: '안전', color: '#39ff14' },
  medium: { icon: '⚠️', label: '도발', color: '#ffd700' },
  high: { icon: '🔥', label: '고위험', color: '#ff4444' }
};

export default function ActionCard({ type = 'flirt', message, risk = 'safe', locked = false, onCopy }) {
  const [copied, setCopied] = useState(false);
  const cardStyle = CARD_TYPES[type] || CARD_TYPES.flirt;
  const riskInfo = RISK_LEVELS[risk] || RISK_LEVELS.safe;

  const handleClick = useCallback(() => {
    if (locked) {
      // Show login prompt
      alert('🔒 전체 멘트를 보려면 공유하기를 먼저 해주세요!');
      return;
    }

    navigator.clipboard?.writeText(message);
    setCopied(true);
    onCopy?.(message);

    setTimeout(() => setCopied(false), 2000);
  }, [message, onCopy, locked]);

  return (
    <div
      className={`action-card ${locked ? 'locked' : ''}`}
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
        <div className="risk-badge" style={{ color: riskInfo.color }}>
          <span>{riskInfo.icon}</span>
          <span className="risk-label">{riskInfo.label}</span>
        </div>
      </div>

      <p className="card-message">
        {locked ? (
          <span className="locked-message">
            🔒 공유하면 잠금 해제!
          </span>
        ) : message}
      </p>

      <div className="card-footer">
        {locked ? (
          <span className="unlock-hint">👆 탭하여 잠금 해제</span>
        ) : copied ? (
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
        .action-card.locked {
          background: rgba(50, 50, 50, 0.3);
          border-color: #666;
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
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.3);
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
        .locked-message {
          color: #888;
          font-style: italic;
        }
        .card-footer {
          margin-top: 12px;
          font-size: 0.75rem;
        }
        .copy-hint {
          color: rgba(255, 255, 255, 0.4);
        }
        .copied-text {
          color: #39ff14;
          font-weight: 600;
        }
        .unlock-hint {
          color: #ffd700;
        }
      `}</style>
    </div>
  );
}
