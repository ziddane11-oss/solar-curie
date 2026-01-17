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

export default function ActionCard({ type = 'flirt', message, onCopy }) {
    const [copied, setCopied] = useState(false);
    const cardStyle = CARD_TYPES[type] || CARD_TYPES.flirt;

    const handleClick = useCallback(() => {
        navigator.clipboard?.writeText(message);
        setCopied(true);
        onCopy?.(message);

        setTimeout(() => setCopied(false), 2000);
    }, [message, onCopy]);

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
                <span className="card-icon">{cardStyle.icon}</span>
                <span className="card-label">{cardStyle.label}</span>
            </div>

            <p className="card-message">{message}</p>

            <div className="card-footer">
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
          max-width: 280px;
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
          gap: 8px;
          margin-bottom: 12px;
        }
        .card-icon {
          font-size: 1.2rem;
        }
        .card-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--card-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .card-message {
          font-size: 1rem;
          color: #fff;
          line-height: 1.5;
          margin: 0;
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
      `}</style>
        </div>
    );
}
