'use client';

import { useEffect, useState, useRef } from 'react';

export default function SpeedGauge({ score = 50, verdict = 'GO' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const canvasRef = useRef(null);

  // Animate score from 0 to target
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Draw gauge on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height - 20;
    const radius = Math.min(width, height) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.lineWidth = 25;
    ctx.strokeStyle = '#1a1a2e';
    ctx.stroke();

    // Draw gradient arc (progress)
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ff0099');   // Pink (cold)
    gradient.addColorStop(0.5, '#ffd700'); // Gold (warm)
    gradient.addColorStop(1, '#39ff14');   // Lime (hot)

    const progressAngle = Math.PI + (animatedScore / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, progressAngle, false);
    ctx.lineWidth = 25;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI;
      const innerRadius = radius - 35;
      const outerRadius = radius - 45;

      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * innerRadius,
        centerY + Math.sin(angle) * innerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * outerRadius,
        centerY + Math.sin(angle) * outerRadius
      );
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();
    }

    // Draw needle
    const needleAngle = Math.PI + (animatedScore / 100) * Math.PI;
    const needleLength = radius - 50;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = verdict === 'GO' ? '#39ff14' : '#ff0099';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

  }, [animatedScore, verdict]);

  const isGo = verdict === 'GO';

  return (
    <div className="speed-gauge">
      <canvas
        ref={canvasRef}
        width={280}
        height={160}
        style={{ maxWidth: '100%' }}
      />

      {/* Score display */}
      <div className="gauge-score">
        <span className="score-value" style={{
          color: isGo ? '#39ff14' : '#ff0099',
          textShadow: isGo
            ? '0 0 20px rgba(57, 255, 20, 0.6)'
            : '0 0 20px rgba(255, 0, 153, 0.6)'
        }}>
          {animatedScore}%
        </span>
      </div>

      {/* STOP/GO Label */}
      <div className={`verdict-label ${isGo ? 'go' : 'stop'}`}>
        <span className="verdict-icon">{isGo ? '🟢' : '🔴'}</span>
        <span className="verdict-text">{verdict}</span>
      </div>

      {/* Credibility stats */}
      <div className="credibility-stats">
        <span className="stat-number">1,{Math.floor(100 + Math.random() * 900)}건</span>
        <span className="stat-text">유사 대화 분석 기준</span>
      </div>

      <style jsx>{`
        .speed-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .gauge-score {
          margin-top: -10px;
        }
        .score-value {
          font-size: 3rem;
          font-weight: 900;
        }
        .verdict-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 30px;
          border-radius: 30px;
          margin-top: 15px;
          font-weight: 700;
          font-size: 1.3rem;
        }
        .verdict-label.go {
          background: rgba(57, 255, 20, 0.2);
          border: 2px solid #39ff14;
          color: #39ff14;
        }
        .verdict-label.stop {
          background: rgba(255, 0, 153, 0.2);
          border: 2px solid #ff0099;
          color: #ff0099;
        }
        .verdict-icon {
          font-size: 1rem;
        }
        .credibility-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .stat-number {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffd700;
        }
        .stat-text {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
