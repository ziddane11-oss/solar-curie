'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  getCurrentTask,
  getUpcomingTasks,
  getUrgencyState,
  formatTimeRange,
  loadTodayTasksFromJson,
} from '@/lib/today-tasks';
import {
  getLocalDateKey,
  loadCompletedTaskIds,
  saveCompletedTaskIds,
} from '@/lib/today-task-completion';
import styles from './TodayTaskDock.module.css';

const URGENCY_LABEL = {
  overdue: '지연',
  current: '진행 중',
  blink1: '1분 이내',
  red5: '5분 이내',
  yellow10: '10분 이내',
  normal: '일반',
};

export default function TodayTaskDock() {
  const [now, setNow] = useState(() => new Date());
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [malformedCount, setMalformedCount] = useState(0);
  const [blinkOn, setBlinkOn] = useState(true);
  const [completedIds, setCompletedIds] = useState([]);

  const dateKey = useMemo(() => getLocalDateKey(now), [now]);

  useEffect(() => {
    setCompletedIds(loadCompletedTaskIds(dateKey));
  }, [dateKey]);

  useEffect(() => {
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    const blinkTimer = setInterval(() => setBlinkOn((prev) => !prev), 700);

    return () => {
      clearInterval(clockTimer);
      clearInterval(blinkTimer);
    };
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

  const { activeTasks, completedTasks } = useMemo(() => {
    const completedSet = new Set(completedIds);
    return {
      activeTasks: tasks.filter((task) => !completedSet.has(task.id)),
      completedTasks: tasks.filter((task) => completedSet.has(task.id)),
    };
  }, [tasks, completedIds]);

  const { currentTask, upcomingTasks } = useMemo(() => ({
    currentTask: getCurrentTask(activeTasks, now),
    upcomingTasks: getUpcomingTasks(activeTasks, now),
  }), [activeTasks, now]);

  const toggleComplete = (taskId) => {
    setCompletedIds((prev) => {
      const exists = prev.includes(taskId);
      const next = exists ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      saveCompletedTaskIds(dateKey, next);
      return next;
    });
  };

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
          <TaskCard task={currentTask} now={now} isCurrent blinkOn={blinkOn} onToggleComplete={toggleComplete} />
        ) : (
          <div className={styles.empty}>진행 중인 작업이 없습니다.</div>
        )}
      </section>

      <section className={styles.section}>
        <h3>다가오는 작업</h3>
        <div className={styles.list}>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} now={now} blinkOn={blinkOn} onToggleComplete={toggleComplete} />
            ))
          ) : (
            <div className={styles.empty}>오늘 남은 작업이 없습니다.</div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h3>완료됨</h3>
        <div className={styles.list}>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                now={now}
                blinkOn={false}
                isCompleted
                onToggleComplete={toggleComplete}
              />
            ))
          ) : (
            <div className={styles.empty}>완료한 작업이 없습니다.</div>
          )}
        </div>
      </section>
    </aside>
  );
}

function TaskCard({ task, now, blinkOn, isCurrent = false, isCompleted = false, onToggleComplete }) {
  const urgency = getUrgencyState(task, now);
  const blinkClass = urgency === 'blink1' && blinkOn ? styles.blinkActive : '';
  const completedClass = isCompleted ? styles.completed : '';

  return (
    <article className={`${styles.card} ${styles[urgency]} ${isCurrent ? styles.currentCard : ''} ${blinkClass} ${completedClass}`}>
      <div className={styles.row}>
        <strong>{task.title}</strong>
        {!isCompleted && <span className={styles.badge}>{URGENCY_LABEL[urgency]}</span>}
      </div>
      <p className={styles.range}>{formatTimeRange(task)}</p>
      <label className={styles.completeControl}>
        <input type="checkbox" checked={isCompleted} onChange={() => onToggleComplete(task.id)} />
        <span>{isCompleted ? '완료 취소' : '완료 처리'}</span>
      </label>
    </article>
  );
}
