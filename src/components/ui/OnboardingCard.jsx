'use client';

import styles from './OnboardingCard.module.css';

export default function OnboardingCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>3분 사용법</h3>
      <ol className={styles.steps}>
        <li>기본정보 입력</li>
        <li>출력·템플릿에서 지원서 파일 선택</li>
        <li>PDF 생성 클릭</li>
      </ol>
      <p className={styles.note}>데이터는 기본적으로 브라우저(LocalStorage)에만 저장됩니다.</p>
    </div>
  );
}
