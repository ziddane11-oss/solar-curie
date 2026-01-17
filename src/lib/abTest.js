// 톡캐디 GRAVITY - A/B Testing

const EXP_KEY = "tc_exp_v1";

// 실험 variant 가져오기 (첫 방문 시 랜덤 배정)
export function getExpVariant() {
    if (typeof window === 'undefined') return 'A';

    const saved = localStorage.getItem(EXP_KEY);
    if (saved === 'A' || saved === 'B') return saved;

    const v = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(EXP_KEY, v);
    return v;
}

// 실험 설정
export const EXP_CONFIG = {
    A: {
        dailyFree: 3,
        shareBonusEnabled: true,
        shareBonusMax: 2,
        name: '무료3회+공유보상'
    },
    B: {
        dailyFree: 5,
        shareBonusEnabled: false,
        shareBonusMax: 0,
        name: '무료5회+보상없음'
    }
};

// 현재 variant의 설정 가져오기
export function getExpConfig() {
    const variant = getExpVariant();
    return EXP_CONFIG[variant];
}

// 강제로 variant 설정 (테스트용)
export function setExpVariant(variant) {
    if (typeof window === 'undefined') return;
    if (variant === 'A' || variant === 'B') {
        localStorage.setItem(EXP_KEY, variant);
    }
}

// 실험 로그 (분석용)
export function logExpEvent(event, params = {}) {
    const variant = getExpVariant();
    console.log('[A/B]', variant, event, params);

    // GA 연동 시
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, { exp_variant: variant, ...params });
    }
}
