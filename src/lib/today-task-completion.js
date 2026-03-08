const STORAGE_KEY = 'today-task-completed-by-date-v1';

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getLocalDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadCompletedTaskIds(dateKey) {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const data = safeParse(raw || '{}');
  const list = data[dateKey];

  if (!Array.isArray(list)) return [];
  return list.filter((item) => typeof item === 'string' && item.trim());
}

export function saveCompletedTaskIds(dateKey, ids) {
  if (typeof window === 'undefined') return;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const data = safeParse(raw || '{}');
  data[dateKey] = Array.from(new Set(ids));

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
