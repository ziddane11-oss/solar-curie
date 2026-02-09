'use client';

import SectionHeader from './SectionHeader';
import styles from './RepeatableSection.module.css';

export default function RepeatableSection({ title, items, onAdd, onRemove, renderItem, addLabel = '+ 항목 추가', complete }) {
  return (
    <div className={styles.wrapper}>
      <SectionHeader title={title} complete={complete} />
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIndex}>{index + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => onRemove(index)}
                >
                  삭제
                </button>
              )}
            </div>
            <div className={styles.cardBody}>
              {renderItem(item, index)}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addBtn} onClick={onAdd}>
        {addLabel}
      </button>
    </div>
  );
}
