// 톡캐디 GRAVITY - Use Counter & Login Trigger

const USE_COUNT_KEY = "tc_use_count";
const LOGIN_PROMPTED_KEY = "tc_login_prompted";

// 사용 횟수 조회
export function getUseCount() {
    if (typeof window === 'undefined') return 0;
    const v = localStorage.getItem(USE_COUNT_KEY);
    const n = v ? Number(v) : 0;
    return Number.isFinite(n) ? n : 0;
}

// 사용 횟수 증가
export function bumpUseCount() {
    if (typeof window === 'undefined') return 0;
    const n = getUseCount() + 1;
    localStorage.setItem(USE_COUNT_KEY, String(n));
    return n;
}

// 로그인 모달 띄운 횟수 기록 (너무 자주 안 띄우려고)
export function getLoginPromptedCount() {
    if (typeof window === 'undefined') return 0;
    const v = localStorage.getItem(LOGIN_PROMPTED_KEY);
    const n = v ? Number(v) : 0;
    return Number.isFinite(n) ? n : 0;
}

export function markLoginPrompted() {
    if (typeof window === 'undefined') return;
    const n = getLoginPromptedCount() + 1;
    localStorage.setItem(LOGIN_PROMPTED_KEY, String(n));
}

// 3회차, 6회차에 로그인 유도 (강요 아님)
export function shouldPromptLogin() {
    const count = getUseCount();
    const prompted = getLoginPromptedCount();

    // 3회차에 처음, 6회차에 한 번 더
    if (count === 3 && prompted < 1) return true;
    if (count === 6 && prompted < 2) return true;

    return false;
}

// 로그인 모달 트리거 헬퍼
export function maybePromptLogin(openLoginModal) {
    const count = bumpUseCount();

    if (shouldPromptLogin()) {
        markLoginPrompted();
        openLoginModal();
        return true;
    }
    return false;
}
