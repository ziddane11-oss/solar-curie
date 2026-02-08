'use client';

import styles from './TabNav.module.css';

export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.badge ? <span className={styles.badge}>{tab.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
}
