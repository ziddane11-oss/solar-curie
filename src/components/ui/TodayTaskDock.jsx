'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  getCurrentTask,
  getUpcomingTasks,
  getUrgencyState,
  formatTimeRange,
  loadTodayTasksFromJson,
} from '@/lib/today-tasks';
import styles from './TodayTaskDock.module.css';

const URGENCY_LABEL = {
  overdue: '지연',
  current: '진행 중',
  urgent: '임박',
  soon: '예정',
  normal: '여유',
};

export default function TodayTaskDock() {
  const [now, setNow] = useState(() => new Date());
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [malformedCount, setMalformedCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setIsLoading(true);
      try {
        const result = await loadTodayTasksFromJson(new Date());
        if (cancelled) return;

        setTasks(result.tasks);
        setMalformedCount(result.malformedCount);

        if (result.sourceInvalid) {
          setFallbackMessage('일정 JSON 형식이 올바르지 않습니다. 배열 형태인지 확인해 주세요.');
        } else if (result.tasks.length === 0) {
          setFallbackMessage('오늘 날짜의 유효한 일정이 없습니다. JSON의 date와 형식을 확인해 주세요.');
        } else {
          setFallbackMessage('');
        }
      } catch {
        if (cancelled) return;
        setTasks([]);
        setMalformedCount(0);
        setFallbackMessage('일정 JSON을 불러오지 못했습니다. public/today-tasks.json 파일을 확인해 주세요.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const { currentTask, upcomingTasks } = useMemo(() => ({
    currentTask: getCurrentTask(tasks, now),
    upcomingTasks: getUpcomingTasks(tasks, now),
  }), [tasks, now]);

  return (
    <aside className={styles.dock} aria-label="오늘 일정 도크">
      <h2 className={styles.title}>오늘 일정</h2>
      <p className={styles.time}>{now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} 기준</p>

      {isLoading && <p className={styles.notice}>일정을 불러오는 중...</p>}
      {!isLoading && fallbackMessage && <p className={styles.notice}>{fallbackMessage}</p>}
      {!isLoading && malformedCount > 0 && (
        <p className={styles.noticeSub}>잘못된 항목 {malformedCount}개는 자동으로 제외했습니다.</p>
      )}

      <section className={styles.section}>
        <h3>현재 작업</h3>
        {currentTask ? (
          <TaskCard task={currentTask} now={now} isCurrent />
        ) : (
          <div className={styles.empty}>진행 중인 작업이 없습니다.</div>
        )}
      </section>

      <section className={styles.section}>
        <h3>다가오는 작업</h3>
        <div className={styles.list}>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => <TaskCard key={task.id} task={task} now={now} />)
          ) : (
            <div className={styles.empty}>오늘 남은 작업이 없습니다.</div>
          )}
        </div>
      </section>
    </aside>
  );
}

function TaskCard({ task, now, isCurrent = false }) {
  const urgency = getUrgencyState(task, now);

  return (
    <article className={`${styles.card} ${styles[urgency]} ${isCurrent ? styles.currentCard : ''}`}>
      <div className={styles.row}>
        <strong>{task.title}</strong>
        <span className={styles.badge}>{URGENCY_LABEL[urgency]}</span>
      </div>
      <p className={styles.range}>{formatTimeRange(task)}</p>
    </article>
  );
}
