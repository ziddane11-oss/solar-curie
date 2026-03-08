function withTodayTime(baseDate, hour, minute = 0) {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function isSameLocalDate(targetDate, now) {
  return (
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate()
  );
}

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

function parseTaskEntry(entry, now, index) {
  if (!entry || typeof entry !== 'object') return null;

  const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `task-${index + 1}`;
  const title = typeof entry.title === 'string' ? entry.title.trim() : '';
  const date = typeof entry.date === 'string' ? entry.date : '';
  const time = parseTimeString(entry.start);
  const durationMin = Number(entry.durationMin);

  if (!title || !date || !time || !Number.isFinite(durationMin) || durationMin <= 0) return null;

  const taskDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(taskDate.getTime()) || !isSameLocalDate(taskDate, now)) return null;

  const startAt = withTodayTime(now, time.hour, time.minute);
  const endAt = new Date(startAt.getTime() + durationMin * 60 * 1000);

  return { id, title, startAt, endAt };
}

export function parseTodayTasks(rawData, now = new Date()) {
  if (!Array.isArray(rawData)) {
    return { tasks: [], malformedCount: 0, sourceInvalid: true };
  }

  let malformedCount = 0;
  const tasks = rawData
    .map((entry, index) => {
      const parsed = parseTaskEntry(entry, now, index);
      if (!parsed && entry && typeof entry === 'object') malformedCount += 1;
      return parsed;
    })
    .filter(Boolean);

  return { tasks: sortTasksByStartTime(tasks), malformedCount, sourceInvalid: false };
}

export async function loadTodayTasksFromJson(now = new Date()) {
  const response = await fetch('/today-tasks.json');
  if (!response.ok) {
    throw new Error('JSON 파일을 찾을 수 없습니다.');
  }

  const raw = await response.json();
  return parseTodayTasks(raw, now);
}

export function sortTasksByStartTime(tasks) {
  return [...tasks].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export function getCurrentTask(tasks, now = new Date()) {
  return tasks.find((task) => now >= task.startAt && now < task.endAt) || null;
}

export function getUpcomingTasks(tasks, now = new Date()) {
  return tasks.filter((task) => task.startAt > now);
}

export function getUrgencyState(task, now = new Date()) {
  if (now >= task.endAt) return 'overdue';
  if (now >= task.startAt && now < task.endAt) return 'current';

  const minutesToStart = (task.startAt.getTime() - now.getTime()) / (1000 * 60);
  if (minutesToStart <= 1) return 'blink1';
  if (minutesToStart <= 5) return 'red5';
  if (minutesToStart <= 10) return 'yellow10';
  return 'normal';
}

export function formatTimeRange(task, locale = 'ko-KR') {
  const start = task.startAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  const end = task.endAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${start} - ${end}`;
}
