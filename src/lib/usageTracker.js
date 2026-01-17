'use client';

// Simple localStorage-based usage tracking
// In production, this would be server-side with user auth

const STORAGE_KEY = 'tokcaddy_usage';

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getUsageData() {
    if (typeof window === 'undefined') return { date: getToday(), count: 0, sharedToday: false };

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { date: getToday(), count: 0, sharedToday: false };

        const parsed = JSON.parse(data);
        // Reset if it's a new day
        if (parsed.date !== getToday()) {
            return { date: getToday(), count: 0, sharedToday: false };
        }
        return parsed;
    } catch {
        return { date: getToday(), count: 0, sharedToday: false };
    }
}

function saveUsageData(data) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, date: getToday() }));
}

export function getDailyLimit() {
    const data = getUsageData();
    const baseLimit = 3;
    const bonusFromShare = data.sharedToday ? 1 : 0;
    return baseLimit + bonusFromShare;
}

export function getRemainingUses() {
    const data = getUsageData();
    const limit = getDailyLimit();
    return Math.max(0, limit - data.count);
}

export function getUsedCount() {
    return getUsageData().count;
}

export function hasSharedToday() {
    return getUsageData().sharedToday;
}

export function useOneCredit() {
    const data = getUsageData();
    data.count += 1;
    saveUsageData(data);
    return getRemainingUses();
}

export function grantShareBonus() {
    const data = getUsageData();
    if (!data.sharedToday) {
        data.sharedToday = true;
        saveUsageData(data);
        return true; // Bonus granted
    }
    return false; // Already shared today
}

export function canUse() {
    return getRemainingUses() > 0;
}

export function getResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}시간 ${minutes}분`;
}

// History (teaser - will need login later)
const HISTORY_KEY = 'tokcaddy_history';

export function saveToHistory(result) {
    if (typeof window === 'undefined') return;

    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        history.unshift({
            ...result,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        // Keep only last 10 for free users
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch {
        // Ignore errors
    }
}

export function getHistory() {
    if (typeof window === 'undefined') return [];

    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getHistoryCount() {
    return getHistory().length;
}
