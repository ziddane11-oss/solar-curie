const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scheduleApi', {
  loadSnapshot: () => ipcRenderer.invoke('schedule:load-snapshot'),
  toggleComplete: (taskId, dateKey) => ipcRenderer.invoke('schedule:toggle-complete', { taskId, dateKey }),
});
