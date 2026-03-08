const clockEl = document.getElementById('clock');
const messageEl = document.getElementById('message');
const currentEl = document.getElementById('current');
const upcomingEl = document.getElementById('upcoming');
const completedEl = document.getElementById('completed');

const labels = {
  overdue: '지연',
  current: '진행 중',
  blink1: '1분 이내',
  red5: '5분 이내',
  yellow10: '10분 이내',
  normal: '일반',
};

let snapshot = null;
let blinkOn = true;

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

function toDateTask(task) {
  return { ...task, startAt: new Date(task.startAt), endAt: new Date(task.endAt) };
}

function renderTaskList(container, tasks, now, dateKey, isCompleted = false, emptyMessage = '작업이 없습니다.') {
  container.innerHTML = '';
  if (!tasks || tasks.length === 0) {
    container.innerHTML = `<div class="empty">${emptyMessage}</div>`;
    return;
  }

  tasks.forEach((rawTask) => {
    const task = toDateTask(rawTask);
    const urgency = getUrgencyState(task, now);
    const blinkClass = urgency === 'blink1' && blinkOn && !isCompleted ? 'blink-active' : '';
    const card = document.createElement('article');
    card.className = `card ${urgency} ${isCompleted ? 'completed' : ''} ${blinkClass}`;

    card.innerHTML = `
      <div class="row">
        <strong>${task.title}</strong>
        ${isCompleted ? '' : `<span class="badge">${labels[urgency]}</span>`}
      </div>
      <p class="range">${formatTimeRange(task)}</p>
      <label class="control">
        <input type="checkbox" ${isCompleted ? 'checked' : ''} />
        <span>${isCompleted ? '완료 취소' : '완료 처리'}</span>
      </label>
    `;

    card.querySelector('input').addEventListener('change', async () => {
      snapshot = await window.scheduleApi.toggleComplete(task.id, dateKey);
      render();
    });

    container.appendChild(card);
  });
}

function render() {
  if (!snapshot) return;
  const now = new Date(snapshot.now);
  clockEl.textContent = `${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} 기준`;
  messageEl.textContent = snapshot.fallbackMessage || (snapshot.malformedCount > 0 ? `잘못된 항목 ${snapshot.malformedCount}개는 제외됨` : '');

  renderTaskList(currentEl, snapshot.currentTask ? [snapshot.currentTask] : [], now, snapshot.dateKey, false, '진행 중인 작업이 없습니다.');
  renderTaskList(upcomingEl, snapshot.upcomingTasks, now, snapshot.dateKey, false, '오늘 남은 작업이 없습니다.');
  renderTaskList(completedEl, snapshot.completedTasks, now, snapshot.dateKey, true, '완료한 작업이 없습니다.');
}

async function refreshSnapshot() {
  snapshot = await window.scheduleApi.loadSnapshot();
  render();
}

setInterval(() => {
  blinkOn = !blinkOn;
  render();
}, 700);
setInterval(refreshSnapshot, 1000);

refreshSnapshot();
