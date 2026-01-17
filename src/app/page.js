'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FloatingText from '@/components/FloatingText';
import BlackHole from '@/components/BlackHole';

// Pre-generated star positions to avoid hydration mismatch
const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 23) % 100}%`,
    top: `${(i * 31 + 11) % 100}%`,
    size: 1 + (i % 3),
    opacity: 0.3 + ((i * 7) % 70) / 100,
    duration: 2 + (i % 3),
    delay: (i % 20) / 10
  }));
};

const STARS = generateStars(50);

export default function Home() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlackHole, setShowBlackHole] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnalyze = useCallback(async (file) => {
    if (!file) return;

    setIsLoading(true);
    setShowBlackHole(true);
  }, []);

  const handleBlackHoleEnd = useCallback(() => {
    // Navigate to result page with mock data for MVP
    router.push('/result');
  }, [router]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleAnalyze(file);
    }
  }, [handleAnalyze]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAnalyze(file);
    }
  }, [handleAnalyze]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Demo button for testing without upload
  const handleDemoClick = useCallback(() => {
    setIsLoading(true);
    setShowBlackHole(true);
  }, []);

  return (
    <main className="main-container">
      {/* Background stars effect */}
      <div className="stars-container">
        {/* Animated stars - using pre-generated values to avoid hydration mismatch */}
        {mounted && STARS.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Floating neon title */}
      {!isLoading && <FloatingText text="톡을 던져봐" subtext="Drop Here" />}

      {/* Upload zone */}
      {!isLoading && (
        <div
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="file-upload"
          />
          <div className="upload-icon">📱</div>
          <div className="upload-text">카톡 스크린샷을 여기에 던져!</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.5 }}>
            또는 클릭해서 선택
          </div>
        </div>
      )}

      {/* Demo button */}
      {!isLoading && (
        <button onClick={handleDemoClick} className="demo-btn">
          🎲 데모 체험하기
        </button>
      )}

      {/* Loading state */}
      {isLoading && !showBlackHole && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div style={{ color: 'var(--neon-pink)' }}>분석 중...</div>
        </div>
      )}

      {/* Black hole animation */}
      <BlackHole isActive={showBlackHole} onAnimationEnd={handleBlackHoleEnd} />


    </main>
  );
}
