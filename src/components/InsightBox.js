'use client';

export default function InsightBox({ persona = '카사노바', insight, beforeText, afterText }) {
    return (
        <div className="insight-box">
            <div className="insight-header">
                <span className="persona-icon">🎭</span>
                <span className="persona-name">{persona}의 한마디</span>
            </div>

            <p className="insight-text">{insight}</p>

            {beforeText && afterText && (
                <div className="translation-box">
                    <div className="translation-row before">
                        <span className="label">변경 전</span>
                        <span className="text">"{beforeText}"</span>
                    </div>
                    <div className="arrow">↓</div>
                    <div className="translation-row after">
                        <span className="label">변경 후</span>
                        <span className="text">"{afterText}"</span>
                    </div>
                </div>
            )}

            <style jsx>{`
        .insight-box {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
        }
        .insight-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .persona-icon {
          font-size: 1.2rem;
        }
        .persona-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffd700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .insight-text {
          font-size: 1.1rem;
          color: #fff;
          line-height: 1.6;
          margin: 0;
          font-style: italic;
        }
        .translation-box {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .translation-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .translation-row.before {
          opacity: 0.6;
        }
        .translation-row.after {
          color: #39ff14;
        }
        .label {
          font-size: 0.7rem;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .text {
          font-size: 0.95rem;
        }
        .arrow {
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
          margin: 8px 0;
        }
      `}</style>
        </div>
    );
}
