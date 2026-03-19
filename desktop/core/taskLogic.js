function parseTimeString(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function withLocalTime(baseDate, hour, minute) {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function parseTask(task, now, index) {
  if (!task || typeof task !== 'object') return null;

  const id = typeof task.id === 'string' && task.id.trim() ? task.id.trim() : `task-${index + 1}`;
  const title = typeof task.title === 'string' ? task.title.trim() : '';
  const date = typeof task.date === 'string' ? task.date.trim() : '';
  const time = parseTimeString(task.start);
  const durationMin = Number(task.durationMin);

  if (!title || !date || !time || !Number.isFinite(durationMin) || durationMin <= 0) return null;
  if (date !== toLocalDateKey(now)) return null;

  const startAt = withLocalTime(now, time.hour, time.minute);
  const endAt = new Date(startAt.getTime() + durationMin * 60 * 1000);

  return { id, title, startAt, endAt };
}

function sortByStart(tasks) {
  return [...tasks].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

function getCurrentTask(tasks, now) {
  return tasks.find((task) => now >= task.startAt && now < task.endAt) || null;
}

function getUpcomingTasks(tasks, now) {
  return tasks.filter((task) => task.startAt > now);
}

function getUrgencyState(task, now) {
  if (now >= task.endAt) return 'overdue';
  if (now >= task.startAt && now < task.endAt) return 'current';

  const minutesToStart = (task.startAt.getTime() - now.getTime()) / (1000 * 60);
  if (minutesToStart <= 1) return 'blink1';
  if (minutesToStart <= 5) return 'red5';
  if (minutesToStart <= 10) return 'yellow10';
  return 'normal';
}

function formatTimeRange(task, locale = 'ko-KR') {
  const start = task.startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  const end = task.endAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${start} - ${end}`;
}

function parseTodayTasks(raw, now = new Date()) {
  if (!Array.isArray(raw)) return { tasks: [], malformedCount: 0, sourceInvalid: true };

  let malformedCount = 0;
  const tasks = raw
    .map((item, idx) => {
      const parsed = parseTask(item, now, idx);
      if (!parsed && item && typeof item === 'object') malformedCount += 1;
      return parsed;
    })
    .filter(Boolean);

  return { tasks: sortByStart(tasks), malformedCount, sourceInvalid: false };
}

function partitionTasks(allTasks, completedIds, now) {
  const completedSet = new Set(completedIds || []);
  const activeTasks = allTasks.filter((task) => !completedSet.has(task.id));
  const completedTasks = allTasks.filter((task) => completedSet.has(task.id));

  return {
    activeTasks,
    completedTasks,
    currentTask: getCurrentTask(activeTasks, now),
    upcomingTasks: getUpcomingTasks(activeTasks, now),
  };
}

module.exports = {
  toLocalDateKey,
  parseTodayTasks,
  partitionTasks,
  getUrgencyState,
  formatTimeRange,
};
