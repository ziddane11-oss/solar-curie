// 톡캐디 GRAVITY - History System

const HISTORY_KEY = "tc_history";
const HISTORY_MAX = 30;

function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function getHistory() {
    if (typeof window === 'undefined') return [];
    const arr = safeParse(localStorage.getItem(HISTORY_KEY), []);
    return Array.isArray(arr) ? arr : [];
}

export function addHistory(item) {
    if (typeof window === 'undefined') return;
    const cur = getHistory();
    const next = [item, ...cur].slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function removeHistory(id) {
    if (typeof window === 'undefined') return;
    const cur = getHistory();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(cur.filter(x => x.id !== id)));
}

export function clearHistory() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
}

export function getHistoryCount() {
    return getHistory().length;
}

// 히스토리 아이템 생성 헬퍼
export function createHistoryItem(result) {
    const KST_OFFSET_MIN = 9 * 60;
    const now = new Date();
    const kstMs = now.getTime() + (KST_OFFSET_MIN * 60_000);
    const kst = new Date(kstMs);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kstDay: `${y}-${m}-${d}`,
        createdAt: Date.now(),
        confidence: result.score,
        verdict: result.verdict === 'GO' ? 'go' : 'stop',
        roast: result.insight?.text || result.verdictMessage,
        actions: result.actionCards || [],
        preview: result.verdictMessage
    };
}
