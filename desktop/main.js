const path = require('path');
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { createDefaultTasks, getPaths, loadJson, saveJson } = require('./core/taskStore');
const { toLocalDateKey, parseTodayTasks, partitionTasks } = require('./core/taskLogic');

const DOCK_WIDTH = 320;
let mainWindow;

function getDockBounds() {
  const display = screen.getPrimaryDisplay();
  const area = display.workArea;
  return {
    x: area.x + area.width - DOCK_WIDTH,
    y: area.y,
    width: DOCK_WIDTH,
    height: area.height,
  };
}

function positionDock() {
  if (!mainWindow) return;
  mainWindow.setBounds(getDockBounds());
}

async function buildSnapshot() {
  const now = new Date();
  const { tasksPath, completionPath } = getPaths(app);

  let rawTasks;
  try {
    rawTasks = await loadJson(tasksPath, createDefaultTasks(toLocalDateKey(now)));
  } catch {
    return {
      now: now.toISOString(),
      dateKey: toLocalDateKey(now),
      malformedCount: 0,
      fallbackMessage: '작업 JSON 파일을 읽을 수 없습니다.',
      currentTask: null,
      upcomingTasks: [],
      completedTasks: [],
    };
  }

  const parsed = parseTodayTasks(rawTasks, now);
  const dateKey = toLocalDateKey(now);

  let completedMap;
  try {
    completedMap = await loadJson(completionPath, {});
  } catch {
    completedMap = {};
  }

  const completedIds = Array.isArray(completedMap[dateKey]) ? completedMap[dateKey] : [];
  const split = partitionTasks(parsed.tasks, completedIds, now);

  let fallbackMessage = '';
  if (parsed.sourceInvalid) fallbackMessage = '작업 JSON 형식이 배열이 아닙니다.';
  else if (parsed.tasks.length === 0) fallbackMessage = '오늘 날짜 작업이 없습니다.';

  return {
    now: now.toISOString(),
    dateKey,
    malformedCount: parsed.malformedCount,
    fallbackMessage,
    currentTask: split.currentTask,
    upcomingTasks: split.upcomingTasks,
    completedTasks: split.completedTasks,
  };
}

async function toggleComplete(taskId, dateKey) {
  const { completionPath } = getPaths(app);
  let data;
  try {
    data = await loadJson(completionPath, {});
  } catch {
    data = {};
  }

  const list = Array.isArray(data[dateKey]) ? data[dateKey] : [];
  const hasTask = list.includes(taskId);
  data[dateKey] = hasTask ? list.filter((id) => id !== taskId) : [...list, taskId];

  await saveJson(completionPath, data);
  return buildSnapshot();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    ...getDockBounds(),
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: false,
    backgroundColor: '#101522',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  positionDock();
}

app.whenReady().then(() => {
  createWindow();
  screen.on('display-metrics-changed', positionDock);
  screen.on('display-added', positionDock);
  screen.on('display-removed', positionDock);

  ipcMain.handle('schedule:load-snapshot', buildSnapshot);
  ipcMain.handle('schedule:toggle-complete', (_, payload) => toggleComplete(payload.taskId, payload.dateKey));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
