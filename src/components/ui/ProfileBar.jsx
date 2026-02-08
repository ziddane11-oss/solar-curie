'use client';

import { useState } from 'react';
import styles from './ProfileBar.module.css';

export default function ProfileBar({
  profiles,
  activeId,
  onSwitch,
  onSaveAs,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
  onImport,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const activeProfile = profiles.find((p) => p.id === activeId);

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <select
          className={styles.profileSelect}
          value={activeId || ''}
          onChange={(e) => onSwitch(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className={styles.menuWrap}>
          <button className={styles.menuBtn} onClick={() => setShowMenu(!showMenu)}>
            ...
          </button>
          {showMenu && (
            <div className={styles.dropdown}>
              <button onClick={() => { onSaveAs(); setShowMenu(false); }}>다른 이름으로 저장</button>
              <button onClick={() => { onRename(); setShowMenu(false); }}>이름 변경</button>
              <button onClick={() => { onDuplicate(); setShowMenu(false); }}>복제</button>
              {profiles.length > 1 && (
                <button className={styles.danger} onClick={() => { onDelete(); setShowMenu(false); }}>삭제</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.ghostBtn} onClick={onImport}>가져오기</button>
        <button className={styles.ghostBtn} onClick={onExport}>내보내기</button>
        {activeProfile && (
          <span className={styles.timestamp}>
            최종 저장: {new Date(activeProfile.updatedAt).toLocaleString('ko-KR')}
          </span>
        )}
      </div>
    </div>
  );
}
