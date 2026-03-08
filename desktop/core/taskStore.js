const fs = require('fs/promises');
const path = require('path');

function createDefaultTasks(todayKey) {
  return [
    { id: 'task-1', title: '데일리 체크', date: todayKey, start: '09:00', durationMin: 30 },
    { id: 'task-2', title: '문서 점검', date: todayKey, start: '10:00', durationMin: 45 },
  ];
}

async function ensureJsonFile(filePath, defaultValue) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function loadJson(filePath, fallback) {
  await ensureJsonFile(filePath, fallback);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function saveJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function getPaths(app) {
  const userData = app.getPath('userData');
  return {
    tasksPath: path.join(userData, 'today-tasks.json'),
    completionPath: path.join(userData, 'completed-by-date.json'),
  };
}

module.exports = {
  createDefaultTasks,
  getPaths,
  loadJson,
  saveJson,
};
