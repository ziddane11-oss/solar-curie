// 톡캐디 GRAVITY - Night Mode & Lock Rules

const KST_OFFSET_MIN = 9 * 60;

// KST 기준 시간 가져오기
function getKstHour(now = new Date()) {
    const kstMs = now.getTime() + (KST_OFFSET_MIN * 60_000);
    const kst = new Date(kstMs);
    return kst.getUTCHours();
}

// 밤인지 확인 (22:00 ~ 03:59 KST)
export function isNightKst(now = new Date()) {
    const h = getKstHour(now);
    return (h >= 22 || h < 4);
}

// 심야인지 확인 (00:00 ~ 05:59 KST) - 더 엄격
export function isLateNightKst(now = new Date()) {
    const h = getKstHour(now);
    return (h >= 0 && h < 6);
}

// 잠금 여부 결정
export function shouldLockAction(params) {
    const { risk, night, freeLeft } = params;

    // 밤 + 고위험 = 잠금
    if (night && risk === 'high') return true;

    // 무료 소진 + 고위험/리스크 = 잠금
    if (freeLeft <= 0 && (risk === 'high' || risk === 'risky')) return true;

    return false;
}

// 잠금 이유 텍스트
export function getLockReason(params) {
    const { risk, night, freeLeft } = params;

    if (night && risk === 'high') {
        return '밤에 고위험 멘트는 신중해야 함';
    }
    if (freeLeft <= 0) {
        return '고위험 멘트라 무료에선 숨김';
    }
    return '이 상황에서 제일 흔한 실수 피하게 해줌';
}

// Night mode 경고 메시지
export function getNightWarning() {
    const h = getKstHour();

    if (h >= 0 && h < 4) {
        return '⚠️ 새벽 문자는 "급해보임" + "술먹음?" 느낌 줌';
    }
    if (h >= 22 || h < 6) {
        return '⚠️ 밤 10시 이후 = 부담스러울 확률 높음';
    }
    return null;
}

// 타이밍 추천
export function getTimingSuggestion() {
    const h = getKstHour();

    if (h >= 0 && h < 7) {
        return {
            warning: true,
            message: '⏰ 지금 보내지 말고 오전 10시 이후에 보내는 게 나음',
            reason: '새벽 문자는 급해보임'
        };
    }
    if (h >= 22) {
        return {
            warning: true,
            message: '⏰ 내일 아침에 보내면 "여유있어 보임" 효과',
            reason: '밤 11시 이후 = 부담'
        };
    }
    return null;
}
