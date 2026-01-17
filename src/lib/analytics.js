// 톡캐디 GRAVITY - Analytics Tracking
// GA/Firebase/PostHog 등으로 교체 가능

const KST_OFFSET_MIN = 9 * 60;

// KST 기준 day/night 구분
function getTimeBucket() {
    const now = new Date();
    const kstMs = now.getTime() + (KST_OFFSET_MIN * 60_000);
    const kst = new Date(kstMs);
    const hour = kst.getUTCHours();
    return (hour >= 6 && hour < 18) ? 'day' : 'night';
}

// 디바이스 타입
function getDeviceType() {
    if (typeof window === 'undefined') return 'unknown';
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

// 메인 트래킹 함수
export function track(event, params = {}) {
    const baseParams = {
        time_bucket: getTimeBucket(),
        device: getDeviceType(),
        timestamp: new Date().toISOString(),
        ...params
    };

    // Console (개발용)
    console.log('[track]', event, baseParams);

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, baseParams);
    }

    // Firebase Analytics
    if (typeof window !== 'undefined' && window.firebase?.analytics) {
        window.firebase.analytics().logEvent(event, baseParams);
    }
}

// ===== 이벤트 헬퍼 함수 =====

export function trackLandingView() {
    track('landing_view');
}

export function trackDropSuccess() {
    track('drop_success');
}

export function trackAnalysisStart() {
    track('analysis_start');
}

export function trackAnalysisComplete(confidence, verdict) {
    track('analysis_complete', { confidence, verdict });
}

export function trackResultView(confidence, verdict) {
    track('result_view', { confidence, verdict });
}

export function trackTabClick(tab) {
    track('tab_click', { tab });
}

export function trackActionCopy(risk) {
    track('action_copy', { risk });
}

export function trackLockedActionClick() {
    track('locked_action_click');
}

export function trackFreeLimitModalView() {
    track('free_limit_modal_view');
}

export function trackShareClick() {
    track('share_click');
}

export function trackShareSuccess() {
    track('share_success');
}

export function trackShareRewardGranted(freeLeft) {
    track('share_reward_granted', { free_left: freeLeft });
}

export function trackLoginPromptView() {
    track('login_prompt_view');
}

export function trackLoginSuccess() {
    track('login_success');
}

export function trackPaywallView() {
    track('paywall_view');
}

export function trackPurchaseSuccess(sku, price) {
    track('purchase_success', { sku, price });
}

// 에러 이벤트
export function trackError(errorType, reason) {
    track('error', { error_type: errorType, reason });
}
