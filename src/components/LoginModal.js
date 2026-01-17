'use client';

import { useState } from 'react';

export default function LoginModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={e => e.stopPropagation()}>
                <div className="login-emoji">📋</div>
                <h2>내 판정 저장할래?</h2>
                <p className="login-benefit">대화 스타일 학습하려면 기록이 필요함</p>
                <p className="login-features">히스토리/즐겨찾기/내 말투 학습 가능</p>

                <div className="login-buttons">
                    <button className="login-btn primary" onClick={() => {
                        alert('로그인 기능 준비중!');
                        onClose();
                    }}>
                        로그인하고 저장
                    </button>
                    <button className="login-btn secondary" onClick={onClose}>
                        나중에
                    </button>
                </div>
            </div>

            <style jsx>{`
        .login-modal-overlay {
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
        .login-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #39ff14;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          max-width: 320px;
          width: 90%;
          box-shadow: 0 0 40px rgba(57, 255, 20, 0.2);
        }
        .login-emoji {
          font-size: 3.5rem;
          margin-bottom: 15px;
        }
        .login-modal h2 {
          color: #39ff14;
          margin-bottom: 12px;
          font-size: 1.3rem;
        }
        .login-benefit {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          margin-bottom: 8px;
        }
        .login-features {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .login-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .login-btn {
          padding: 14px 24px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .login-btn.primary {
          background: linear-gradient(135deg, #39ff14, #00ff88);
          border: none;
          color: #000;
        }
        .login-btn.primary:hover {
          transform: scale(1.03);
        }
        .login-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
        </div>
    );
}
