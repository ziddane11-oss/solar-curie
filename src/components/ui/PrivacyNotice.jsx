'use client';

import { useState } from 'react';
import styles from './PrivacyNotice.module.css';

export default function PrivacyNotice({ onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className={styles.notice}>
      <div className={styles.icon}>i</div>
      <div className={styles.content}>
        <p className={styles.text}>
          모든 데이터는 이 브라우저의 LocalStorage에만 저장됩니다.
          서버로 전송되지 않으며, 브라우저 데이터를 삭제하면 함께 사라집니다.
          중요한 데이터는 <strong>내보내기</strong>로 백업하세요.
        </p>
        <button className={styles.resetBtn} onClick={handleReset}>
          {confirmReset ? '정말 삭제하시겠습니까?' : '모든 데이터 초기화'}
        </button>
      </div>
    </div>
  );
}
