// 타임스탬프 및 스티커 분석 함수
// chatAnalyzer.js에 추가

/**
 * 타임스탬프 분석
 */
export function analyzeTimestamps(parsed) {
    const timePatterns = {
        hasTimestamps: false,
        avgResponseTime: null,
        nightMessages: 0,  // 밤 11시~새벽 5시
        instantReplies: 0 // 1분 이내 답장
    };

    const messages = parsed.messages || [];
    if (messages.length === 0) return timePatterns;

    // 시간 파싱
    const times = messages.map(msg => {
        const timeMatch = msg.content.match(/\[(\d{1,2}):(\d{2})\]/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1]);
            const minute = parseInt(timeMatch[2]);
            return { hour, minute, sender: msg.sender };
        }
        return null;
    }).filter(Boolean);

    if (times.length === 0) return timePatterns;

    timePatterns.hasTimestamps = true;

    // 밤 메시지 카운트
    timePatterns.nightMessages = times.filter(t =>
        t.hour >= 23 || t.hour < 5
    ).length;

    // 즉답 카운트 (연속된 메시지 간 1분 이내)
    for (let i = 1; i < times.length; i++) {
        if (times[i].sender !== times[i - 1].sender) {
            const timeDiff = (times[i].hour - times[i - 1].hour) * 60 +
                (times[i].minute - times[i - 1].minute);
            if (timeDiff >= 0 && timeDiff <= 1) {
                timePatterns.instantReplies++;
            }
        }
    }

    return timePatterns;
}

/**
 * 스티커/이미지 분석
 */
export function analyzeStickerPatterns(parsed) {
    const patterns = {
        heartStickers: 0,
        laughStickers: 0,
        sadStickers: 0,
        angryStickers: 0,
        photoShares: 0
    };

    const messages = parsed.messages || [];

    messages.forEach(msg => {
        const content = msg.content.toLowerCase();

        if (content.includes('[스티커:하트]')) patterns.heartStickers++;
        if (content.includes('[스티커:웃음]')) patterns.laughStickers++;
        if (content.includes('[스티커:슬픔]')) patterns.sadStickers++;
        if (content.includes('[스티커:화남]')) patterns.angryStickers++;
        if (content.includes('[사진공유]')) patterns.photoShares++;
    });

    return patterns;
}

/**
 * 타임스탬프 기반 점수 보정
 */
export function adjustScoreByTime(baseScore, timePatterns) {
    let adjustment = 0;

    // 밤 메시지 (+5점/개, 최대 +20)
    if (timePatterns.nightMessages > 0) {
        adjustment += Math.min(timePatterns.nightMessages * 5, 20);
    }

    // 즉답 (+10점/개, 최대 +30)
    if (timePatterns.instantReplies > 0) {
        adjustment += Math.min(timePatterns.instantReplies * 10, 30);
    }

    return adjustment;
}

/**
 * 스티커 기반 점수 보정
 */
export function adjustScoreByStickers(baseScore, stickerPatterns) {
    let adjustment = 0;

    // 하트 스티커 (+20점/개, 최대 +40)
    if (stickerPatterns.heartStickers > 0) {
        adjustment += Math.min(stickerPatterns.heartStickers * 20, 40);
    }

    // 웃음 스티커 (+10점/개, 최대 +20)
    if (stickerPatterns.laughStickers > 0) {
        adjustment += Math.min(stickerPatterns.laughStickers * 10, 20);
    }

    // 사진 공유 (+15점/개, 최대 +30)
    if (stickerPatterns.photoShares > 0) {
        adjustment += Math.min(stickerPatterns.photoShares * 15, 30);
    }

    // 슬픔/화남 스티커 (-10점/개)
    if (stickerPatterns.sadStickers > 0) {
        adjustment -= stickerPatterns.sadStickers * 10;
    }
    if (stickerPatterns.angryStickers > 0) {
        adjustment -= stickerPatterns.angryStickers * 10;
    }

    return adjustment;
}
