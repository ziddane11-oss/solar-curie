'use client';

import Link from "next/link";

export default function IGPage() {
    return (
        <div className="ig-container">
            <div className="ig-content">
                <div className="ig-label">AI 연애 판정기</div>

                <h1 className="ig-title">
                    지금 답장<br />
                    보내도 되는지<br />
                    <span className="highlight">AI가 판단함</span>
                </h1>

                <div className="ig-desc">
                    캡처 공유 많음 · 로그인 없음
                </div>

                <Link href="/" className="ig-cta">
                    바로 분석해보기
                </Link>

                <div className="ig-note">
                    인스타 스토리에서 보고 왔다면 눌러보셈
                </div>
            </div>

            <style jsx>{`
                .ig-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: #000;
                    color: white;
                }
                .ig-content {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .ig-label {
                    font-size: 0.9rem;
                    opacity: 0.7;
                }
                .ig-title {
                    margin-top: 15px;
                    font-size: 2rem;
                    font-weight: 900;
                    line-height: 1.3;
                }
                .highlight {
                    background: linear-gradient(135deg, #ff0099, #00d4ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .ig-desc {
                    margin-top: 15px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                .ig-cta {
                    display: block;
                    margin-top: 25px;
                    padding: 18px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    background: linear-gradient(135deg, #ff0099, #ff6b9d);
                    color: white;
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                .ig-cta:hover {
                    transform: scale(1.02);
                }
                .ig-note {
                    margin-top: 15px;
                    font-size: 0.75rem;
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
}
