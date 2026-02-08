'use client';

import styles from './RepeatableSection.module.css';

export default function RepeatableSection({ title, items, onAdd, onRemove, renderItem, addLabel = '+ 항목 추가' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button type="button" className={styles.addBtn} onClick={onAdd}>
          {addLabel}
        </button>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.itemContent}>
              {renderItem(item, index)}
            </div>
            {items.length > 1 && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove(index)}
                title="삭제"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
