// 톡캐디 GRAVITY - Quota System (Production)
// KST 기준 일일 리셋, 무료 3회, 공유 보상 하루 2회 한도

const KST_OFFSET_MIN = 9 * 60;

// KST 기준 오늘 날짜 키 생성
function getKstDateKey(now = new Date()) {
    const kstMs = now.getTime() + (KST_OFFSET_MIN * 60_000);
    const kst = new Date(kstMs);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function lsGetInt(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    const v = localStorage.getItem(key);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : fallback;
}

function lsSet(key, value) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, String(value));
}

function lsGet(key) {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
}

// 일일 리셋 체크 (KST 0시 기준)
export function ensureDailyReset() {
    if (typeof window === 'undefined') return;

    const today = getKstDateKey();
    const storedDay = lsGet("tc_day");

    if (storedDay !== today) {
        lsSet("tc_day", today);
        lsSet("tc_free_left", 3);           // 하루 무료 3회
        lsSet("tc_share_bonus_used", 0);    // 공유 보너스 사용량 리셋
    }
}

// 남은 무료 횟수
export function getFreeLeft() {
    ensureDailyReset();
    return lsGetInt("tc_free_left", 3);
}

// 무료 1회 차감
export function consumeFreeOnce() {
    ensureDailyReset();
    const left = getFreeLeft();
    if (left <= 0) return false;
    lsSet("tc_free_left", left - 1);
    return true;
}

// 무료 분석 가능 여부
export function canUse() {
    return getFreeLeft() > 0;
}

// 공유 보너스 받을 수 있는지 (하루 2회 한도)
export function canClaimShareBonus() {
    ensureDailyReset();
    const used = lsGetInt("tc_share_bonus_used", 0);
    return used < 2;
}

// 공유 보너스 +1회 지급
export function claimShareBonus() {
    ensureDailyReset();
    if (!canClaimShareBonus()) return false;

    const used = lsGetInt("tc_share_bonus_used", 0);
    const left = getFreeLeft();

    lsSet("tc_share_bonus_used", used + 1);
    lsSet("tc_free_left", left + 1);
    return true;
}

// 일일 한도
export function getDailyLimit() {
    return 3;
}

// 남은 공유 보너스 횟수
export function getShareBonusLeft() {
    ensureDailyReset();
    const used = lsGetInt("tc_share_bonus_used", 0);
    return Math.max(0, 2 - used);
}

// 리셋까지 남은 시간
export function getResetTime() {
    const now = new Date();
    const kstMs = now.getTime() + (KST_OFFSET_MIN * 60_000);
    const kst = new Date(kstMs);

    const tomorrow = new Date(kst);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - kst.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}시간 ${minutes}분`;
}

// ===== 히스토리 (선택) =====
const HISTORY_KEY = 'tc_history';

export function saveToHistory(result) {
    if (typeof window === 'undefined') return;

    try {
        const history = JSON.parse(lsGet(HISTORY_KEY) || '[]');
        history.unshift({
            ...result,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        lsSet(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch {
        // Ignore
    }
}

export function getHistory() {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(lsGet(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getHistoryCount() {
    return getHistory().length;
}

// ===== Legacy 호환 =====
export function getRemainingUses() {
    return getFreeLeft();
}

export function useOneCredit() {
    return consumeFreeOnce();
}

export function grantShareBonus() {
    return claimShareBonus();
}

export function hasSharedToday() {
    ensureDailyReset();
    return lsGetInt("tc_share_bonus_used", 0) > 0;
}
