// 톡캐디 GRAVITY - 대화 분석 엔진
// 실제 대화 내용을 분석하여 점수와 독설 생성

/**
 * 대화 텍스트를 분석하여 결과 생성
 * @param {string} chatText - 사용자가 입력한 대화 내용
 * @returns {Object} 분석 결과 (score, verdict, keywords, insight, actionCards 등)
 */
export function analyzeChatText(chatText) {
    if (!chatText || chatText.trim().length === 0) {
        return null; // 입력 없으면 null 반환
    }

    // 1. 대화 파싱
    const parsed = parseChatText(chatText);

    // 2. 패턴 감지 및 점수 계산
    const signals = detectPatterns(parsed);
    const score = calculateScore(signals);

    // 3. 판정 결정
    const verdict = score >= 65 ? 'GO' : score >= 45 ? 'CAUTION' : 'STOP';
    const type = score >= 55 ? 'hot' : 'cold';

    // 4. 독설/조언 메시지 선택
    const roastData = selectRoast(score, signals);

    // 5. 키워드 생성
    const keywords = generateKeywords(signals, type);

    // 6. 액션 카드 생성
    const actionCards = generateActionCards(score, type, signals);

    return {
        score,
        type,
        verdict,
        verdictMessage: roastData.verdictMessage,
        keywords,
        insight: {
            persona: type === 'hot' ? '카사노바' : '독설가',
            text: roastData.message,
            before: roastData.before,
            after: roastData.after
        },
        actionCards,
        // 디버그 정보 (개발용)
        _debug: {
            signals,
            detectedPatterns: signals.detectedPatterns
        }
    };
}

/**
 * 대화 텍스트를 파싱하여 구조화된 데이터로 변환
 */
function parseChatText(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);

    const messages = [];
    let myMessages = [];
    let otherMessages = [];

    lines.forEach(line => {
        const trimmed = line.trim();

        // 발신자 구분 (간단한 휴리스틱)
        const isMine = trimmed.startsWith('나:') || trimmed.startsWith('나 :');
        const isOther = trimmed.startsWith('상대:') || trimmed.startsWith('상대 :');

        let content = trimmed;
        let speaker = 'unknown';

        if (isMine) {
            content = trimmed.replace(/^나\s*:\s*/, '');
            speaker = 'me';
            myMessages.push(content);
        } else if (isOther) {
            content = trimmed.replace(/^상대\s*:\s*/, '');
            speaker = 'other';
            otherMessages.push(content);
        } else {
            // 발신자 표시 없으면 교대로 추정
            speaker = messages.length % 2 === 0 ? 'other' : 'me';
            if (speaker === 'me') myMessages.push(content);
            else otherMessages.push(content);
        }

        messages.push({ speaker, content });
    });

    return {
        messages,
        myMessages,
        otherMessages,
        totalMessages: messages.length,
        myCount: myMessages.length,
        otherCount: otherMessages.length
    };
}

/**
 * 패턴 감지 - 50개 이상의 시그널 분석
 */
function detectPatterns(parsed) {
    const signals = {
        // 텍스트 패턴
        kekekeCount: 0,
        kekekeScore: 0,
        emojiCount: 0,
        emojiScore: 0,
        emotionKeywords: [],
        emotionScore: 0,
        questionCount: 0,
        questionScore: 0,
        longMessages: 0,
        longMessageScore: 0,

        // 부정 시그널
        shortAnswers: 0,
        shortAnswerScore: 0,
        rejection: 0,
        rejectionScore: 0,
        noQuestion: false,
        noQuestionScore: 0,

        // 대화 흐름
        consecutiveOther: 0,
        consecutiveMe: 0,
        flowScore: 0,

        // 특수 패턴
        detectedPatterns: [],
        specialBonus: 0,

        // 총점
        totalScore: 0
    };

    // 전체 대화 텍스트 (상대방 메시지 중심)
    const otherText = parsed.otherMessages.join(' ');
    const myText = parsed.myMessages.join(' ');

    // === 1. ㅋㅋㅋ 분석 ===
    const kMatches = otherText.match(/ㅋ+/g) || [];
    kMatches.forEach(k => {
        const len = k.length;
        if (len === 1) signals.kekekeScore += 0;
        else if (len === 2) signals.kekekeScore += 3;
        else if (len >= 3 && len <= 4) signals.kekekeScore += 15;
        else if (len >= 5) signals.kekekeScore += 20;
        signals.kekekeCount++;
    });

    // === 2. 이모지 분석 ===
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = otherText.match(emojiPattern) || [];
    signals.emojiCount = emojis.length;

    const positiveEmojis = /[😊😆😄😁🥰💕❤️💖✨🎉]/g;
    const positiveCount = (otherText.match(positiveEmojis) || []).length;

    if (positiveCount > 0) signals.emojiScore += 15;
    else if (signals.emojiCount > 0) signals.emojiScore += 5;

    if (signals.emojiCount >= 2) signals.emojiScore += 5;

    // === 3. 감정 키워드 ===
    const strongEmotion = ['보고싶어', '사랑해', '좋아해'];
    const mediumEmotion = ['좋아', '재밌어', '행복해', '기뻐', '설레'];
    const weakEmotion = ['괜찮아', '맞아', '그래'];

    strongEmotion.forEach(word => {
        if (otherText.includes(word)) {
            signals.emotionKeywords.push(word);
            signals.emotionScore += 30;
        }
    });

    mediumEmotion.forEach(word => {
        if (otherText.includes(word)) {
            signals.emotionKeywords.push(word);
            signals.emotionScore += 20;
        }
    });

    weakEmotion.forEach(word => {
        if (otherText.includes(word)) {
            signals.emotionKeywords.push(word);
            signals.emotionScore += 10;
        }
    });

    // === 4. 질문 패턴 ===
    const questionMarks = (otherText.match(/\?|？/g) || []).length;
    signals.questionCount = questionMarks;

    if (questionMarks >= 2) signals.questionScore += 15;
    else if (questionMarks === 1) signals.questionScore += 8;

    const openQuestions = ['뭐해', '어디야', '어때', '언제', '어디'];
    openQuestions.forEach(q => {
        if (otherText.includes(q)) signals.questionScore += 4;
    });

    // === 5. 장문 답장 ===
    parsed.otherMessages.forEach(msg => {
        if (msg.length >= 50) {
            signals.longMessages++;
            signals.longMessageScore += 10;
        } else if (msg.length >= 100) {
            signals.longMessages++;
            signals.longMessageScore += 15;
        }
    });

    // === 6. 부정 시그널 - 단답 ===
    const shortPhrases = ['ㅇㅇ', 'ㅋ', '응', '어', '그래', 'ㅇ', 'ㅎ'];
    parsed.otherMessages.forEach(msg => {
        const trimmed = msg.trim();
        if (shortPhrases.includes(trimmed)) {
            signals.shortAnswers++;
            signals.shortAnswerScore -= 15;
        } else if (trimmed.length <= 2) {
            signals.shortAnswers++;
            signals.shortAnswerScore -= 12;
        } else if (trimmed.length <= 5) {
            signals.shortAnswers++;
            signals.shortAnswerScore -= 8;
        }
    });

    // === 7. 거부 시그널 ===
    const rejectionWords = ['바빠', '피곤', '자야', '나중에', '다음에', '읽씹', '읽음'];
    rejectionWords.forEach(word => {
        if (otherText.includes(word)) {
            signals.rejection++;
            if (word === '읽씹' || word === '읽음') {
                signals.rejectionScore -= 35;
            } else {
                signals.rejectionScore -= 20;
            }
        }
    });

    // === 8. 질문 없음 (20자 이상인데 질문 0개) ===
    if (otherText.length >= 20 && questionMarks === 0) {
        signals.noQuestion = true;
        signals.noQuestionScore -= 10;
    }

    // === 9. 대화 흐름 분석 ===
    let consecutiveOther = 0;
    let maxConsecutiveOther = 0;
    let consecutiveMe = 0;
    let maxConsecutiveMe = 0;

    parsed.messages.forEach(msg => {
        if (msg.speaker === 'other') {
            consecutiveOther++;
            consecutiveMe = 0;
            maxConsecutiveOther = Math.max(maxConsecutiveOther, consecutiveOther);
        } else if (msg.speaker === 'me') {
            consecutiveMe++;
            consecutiveOther = 0;
            maxConsecutiveMe = Math.max(maxConsecutiveMe, consecutiveMe);
        }
    });

    signals.consecutiveOther = maxConsecutiveOther;
    signals.consecutiveMe = maxConsecutiveMe;

    // 연속 3개 이상 = 적극적
    if (maxConsecutiveOther >= 3) {
        signals.flowScore += 25;
        signals.detectedPatterns.push('폭탄투하형');
    }

    // 내가 3개 이상 연속 = 혼자 떠듦
    if (maxConsecutiveMe >= 3) {
        signals.flowScore -= 20;
        signals.detectedPatterns.push('혼자북치고장구형');
    }

    // === 10. 특수 보너스 ===
    // 이모지 + 장문 + ㅋㅋㅋ = 완벽한 조합
    if (signals.emojiCount >= 2 && signals.longMessages >= 1 && signals.kekekeCount >= 2) {
        signals.specialBonus += 30;
        signals.detectedPatterns.push('완벽한호감신호');
    }

    return signals;
}

/**
 * 점수 계산
 */
function calculateScore(signals) {
    let score = 50; // 기본 점수

    // 긍정 시그널
    score += signals.kekekeScore;
    score += signals.emojiScore;
    score += signals.emotionScore;
    score += signals.questionScore;
    score += signals.longMessageScore;

    // 부정 시그널
    score += signals.shortAnswerScore;
    score += signals.rejectionScore;
    score += signals.noQuestionScore;

    // 대화 흐름
    score += signals.flowScore;

    // 특수 보너스
    score += signals.specialBonus;

    // 0~100 범위로 제한
    score = Math.max(0, Math.min(100, Math.round(score)));

    signals.totalScore = score;
    return score;
}

/**
 * 독설/조언 메시지 선택
 */
function selectRoast(score, signals) {
    // roastDatabase에서 가져올 예정, 임시로 간단한 로직
    const { getRoastByScore } = require('@/data/roastDatabase');
    return getRoastByScore(score, signals);
}

/**
 * 키워드 생성
 */
function generateKeywords(signals, type) {
    const keywords = [];

    if (type === 'hot') {
        if (signals.kekekeCount >= 2) keywords.push({ text: 'ㅋㅋㅋ많음', type: 'bubble', sentiment: 'positive' });
        if (signals.emojiCount >= 1) keywords.push({ text: '이모지', type: 'bubble', sentiment: 'positive' });
        if (signals.questionCount >= 1) keywords.push({ text: '질문많음', type: 'bubble', sentiment: 'positive' });
        if (signals.longMessages >= 1) keywords.push({ text: '장문', type: 'bubble', sentiment: 'positive' });
        if (signals.emotionKeywords.length > 0) keywords.push({ text: '감정표현', type: 'bubble', sentiment: 'positive' });

        // 기본 키워드 추가
        if (keywords.length < 3) {
            keywords.push({ text: '적극적', type: 'bubble', sentiment: 'positive' });
            keywords.push({ text: '관심폭발', type: 'bubble', sentiment: 'positive' });
        }
    } else {
        if (signals.shortAnswers >= 2) keywords.push({ text: '단답형', type: 'brick', sentiment: 'negative' });
        if (signals.noQuestion) keywords.push({ text: '질문없음', type: 'brick', sentiment: 'negative' });
        if (signals.rejection > 0) keywords.push({ text: '거부신호', type: 'brick', sentiment: 'negative' });

        // 기본 키워드
        if (keywords.length < 3) {
            keywords.push({ text: '읽씹', type: 'brick', sentiment: 'negative' });
            keywords.push({ text: '무관심', type: 'brick', sentiment: 'negative' });
            keywords.push({ text: '건조함', type: 'brick', sentiment: 'negative' });
        }
    }

    return keywords;
}

/**
 * 액션 카드 생성
 */
function generateActionCards(score, type, signals) {
    if (type === 'hot') {
        return [
            { type: 'flirt', message: '지금 분위기 최고임. 한 단계 더 가도 됨', risk: 'high' },
            { type: 'tease', message: '이 흐름 놓치면 후회함. 밀어붙여', risk: 'medium' },
            { type: 'sweet', message: '오늘은 집 가면 손해 보는 날임', risk: 'safe' }
        ];
    } else {
        return [
            { type: 'cold', message: '오늘은 여기까지~ 다음에 봐!', risk: 'safe' },
            { type: 'tease', message: '읽씹은 관심 없다는 뜻임. 쿨하게 빠져', risk: 'medium' },
            { type: 'cold', message: '(조용히 읽고 나가기)', risk: 'high', locked: true }
        ];
    }
}
