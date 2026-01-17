// 톡캐디 GRAVITY - Share Utilities

// 공유 텍스트 생성
export function createShareText(score, verdict, verdictMessage) {
    const prompts = [
        `오늘 밤 성공확률 ${score}%… 너라면 뭐 보냄?`,
        `이거 답장 뭐가 정답임? (${score}%)`,
        `나 지금 멘붕… 3초만 봐줘 (${verdict === 'GO' ? '가능성 있음' : '위험함'})`
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return `${randomPrompt}

${verdict === 'GO' ? '🟢' : '🔴'} ${score}% - ${verdictMessage}

👉 톡캐디 GRAVITY
https://solar-curie.vercel.app
#톡캐디 #딸깍연애단`;
}

// 공유 실행
export async function shareResult(payload) {
    try {
        // 모바일/지원 브라우저: navigator.share
        if (navigator.share) {
            await navigator.share({
                title: payload.title || '톡캐디 GRAVITY',
                text: payload.text,
                url: payload.url || 'https://solar-curie.vercel.app'
            });
            return { success: true, method: 'native' };
        }

        // 데스크탑 fallback: 클립보드 복사
        const fullText = `${payload.text}\n${payload.url || 'https://solar-curie.vercel.app'}`;
        await navigator.clipboard.writeText(fullText);
        return { success: true, method: 'clipboard' };

    } catch (err) {
        // 사용자 취소 or 에러
        if (err.name === 'AbortError') {
            return { success: false, method: 'cancelled' };
        }

        // 마지막 fallback
        try {
            const textArea = document.createElement('textarea');
            textArea.value = payload.text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return { success: true, method: 'execCommand' };
        } catch {
            return { success: false, method: 'failed' };
        }
    }
}

// 공유 이미지용 텍스트 (캡처 오버레이)
export function getShareOverlayText(score, verdict) {
    return {
        headline: `오늘 밤 성공확률 ${score}%`,
        subline: `판정: ${verdict === 'GO' ? 'GO! 밀어붙여' : 'STOP 그만해'}`,
        brand: '톡캐디 GRAVITY'
    };
}

// 인스타 스토리용 캡처 저장
export async function saveShareCardPng() {
    if (typeof window === 'undefined') return { ok: false, reason: 'ssr' };

    const node = document.getElementById('share-card');
    if (!node) return { ok: false, reason: 'no_node' };

    try {
        // Dynamic import to avoid SSR issues
        const { toPng } = await import('html-to-image');

        // 폰트 로딩 대기
        await new Promise(r => setTimeout(r, 300));

        const dataUrl = await toPng(node, {
            cacheBust: true,
            pixelRatio: 2, // 선명도 업
            backgroundColor: '#000'
        });

        // 다운로드 링크 생성
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'talkcaddy-result.png';
        a.click();

        return { ok: true };
    } catch (e) {
        console.error('Share card capture failed:', e);

        // iOS fallback: 이미지 새 탭 열기
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(node, { pixelRatio: 2 });
            window.open(dataUrl, '_blank');
            return { ok: true, method: 'new_tab' };
        } catch {
            return { ok: false, reason: 'toPng_fail' };
        }
    }
}

// 링크만 복사
export async function copyShareLink(score, verdict) {
    const url = `https://solar-curie.vercel.app?c=${score}&v=${verdict}`;
    try {
        await navigator.clipboard.writeText(url);
        return { ok: true };
    } catch {
        return { ok: false };
    }
}

