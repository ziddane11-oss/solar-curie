// 톡캐디 GRAVITY - Instagram Guide (1회만 표시)

const KEY = "tc_insta_guide_shown";

export function shouldShowInstaGuide() {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(KEY) !== "1";
    } catch {
        return false;
    }
}

export function markInstaGuideShown() {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(KEY, "1");
    } catch { }
}
