'use client';

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function ResultPreviewPage({ searchParams }) {
  const c = Number(searchParams?.c ?? 0);
  const v = (searchParams?.v ?? "STOP").toString().toUpperCase();
  const src = searchParams?.src ?? "unknown";

  const verdictText =
    v === "GO" ? "밀어붙여" : v === "CAUTION" ? "조심" : "그만해";

  const verdictColor = v === "GO" ? "#39ff14" : "#ff4444";

  // STOP일 때 서브 텍스트 (위기감)
  const verdictWarn = v === "GO"
    ? "지금이 밀어붙일 타이밍임"
    : "지금 보내면 마이너스 시작";

  // 페이지 뷰 트래킹
  useEffect(() => {
    track("result_preview_view", { src, score: c, verdict: v });
  }, [src, c, v]);

  return (
    <div className="preview-container">
      <div className="preview-content">
        <div className="preview-label">AI 연애 판정서</div>

        <div className="preview-card">
          <div className="preview-card-header">
            <span>오늘 밤 성공확률</span>
            <span>{new Date().toLocaleDateString("ko-KR")}</span>
          </div>

          <div className="preview-card-main">
            <div className="preview-score">{c}%</div>
            <div className="preview-verdict">
              <div className="verdict-text" style={{ color: verdictColor }}>{v}</div>
              <div className="verdict-sub">{verdictText}</div>
            </div>
          </div>

          <div className="verdict-warn">{verdictWarn}</div>

          <div className="preview-question">
            지금 답장 하나로 결과 바뀜. <b>너라면?</b>
          </div>
        </div>

        <div className="preview-buttons">
          <Link href="/" className="btn-primary" onClick={() => track("cta_start_click", { from: "preview_main" })}>
            지금 답장 분석하기
          </Link>
          <Link href="/" className="btn-secondary" onClick={() => track("cta_start_click", { from: "preview_free" })}>
            무료
          </Link>
        </div>

        <div className="preview-note">
          * 로그인 없이 3초만에 판정
        </div>
      </div>

      <style jsx>{`
        .preview-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #000;
          color: white;
        }
        .preview-content {
          width: 100%;
          max-width: 400px;
        }
        .preview-label {
          font-size: 0.9rem;
          opacity: 0.7;
        }
        .preview-card {
          margin-top: 15px;
          padding: 25px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(180deg, rgba(255,0,150,0.18), rgba(0,0,0,0.65));
        }
        .preview-card-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        .preview-card-main {
          margin-top: 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .preview-score {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #ff0099, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .preview-verdict {
          text-align: right;
        }
        .verdict-text {
          font-size: 2rem;
          font-weight: 800;
        }
        .verdict-sub {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 4px;
        }
        .verdict-warn {
          margin-top: 15px;
          font-size: 0.85rem;
          color: #ff6b9d;
          font-weight: 500;
        }
        .preview-question {
          margin-top: 15px;
          font-size: 0.95rem;
          opacity: 0.8;
        }
        .preview-buttons {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .btn-primary {
          flex: 1;
          padding: 16px;
          border-radius: 20px;
          text-align: center;
          font-weight: 700;
          background: linear-gradient(135deg, #ff0099, #ff6b9d);
          color: white;
          text-decoration: none;
        }
        .btn-secondary {
          width: 80px;
          padding: 16px;
          border-radius: 20px;
          text-align: center;
          font-weight: 600;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          text-decoration: none;
        }
        .preview-note {
          margin-top: 15px;
          font-size: 0.75rem;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
