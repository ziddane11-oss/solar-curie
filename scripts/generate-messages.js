// 독설 메시지 900개 생성 스크립트
// Gemini API를 사용하여 자동 생성

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'AIzaSyAreEOSoTrmZx68HxJdAhk0HLvFscUxCRA');

// 카테고리별 생성 목표
const TARGETS = {
    POSITIVE_STRONG: { current: 30, target: 200, scoreRange: '75~100점' },
    POSITIVE_MEDIUM: { current: 20, target: 200, scoreRange: '55~74점' },
    POSITIVE_SOFT: { current: 15, target: 150, scoreRange: '45~54점' },
    NEGATIVE_SOFT: { current: 15, target: 150, scoreRange: '30~44점' },
    NEGATIVE_MEDIUM: { current: 20, target: 200, scoreRange: '15~29점' },
    NEGATIVE_STRONG: { current: 20, target: 200, scoreRange: '0~14점' }
};

async function generateMessages(category, count, scoreRange, tone) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `당신은 연애 대화 분석 전문가입니다. 카카오톡 대화를 분석하여 냉정하고 직설적인 독설/조언을 제공하는 메시지를 생성해주세요.

**카테고리**: ${category}
**점수 범위**: ${scoreRange}
**어조**: ${tone}

**생성 개수**: ${count}개

**메시지 형식**:
\`\`\`javascript
{
  message: "독설/조언 내용 (1~2문장, 직설적이고 냉정하게)",
  before: "상대방 행동 요약",
  after: "상대방 심리 해석",
  verdictMessage: "최종 판정 메시지",
  triggers: ['패턴1', '패턴2'] // 해당되는 경우만
}
\`\`\`

**트리거 종류**:
- '많은ㅋ': ㅋㅋㅋ 2개 이상
- '이모지': 이모지 사용
- '장문': 긴 답장
- '질문': 물음표 사용
- '단답': 짧은 답변
- '거부': 거절 신호
- '읽씹': 읽고 무시
- '연속톡': 상대가 연속 메시지
- '혼자떠듦': 내가 혼자 떠듦

**주의사항**:
1. 각 메시지는 독특하고 중복되지 않아야 함
2. 실제 카톡 대화에서 발견할 수 있는 구체적인 패턴 언급
3. "ㅋㅋㅋ", "이모지", "답장 속도", "질문 유무" 등 구체적 요소 포함
4. 독설은 냉정하지만 도움이 되는 방향으로
5. triggers는 해당되는 경우에만 추가

**출력**: JavaScript 배열 형식으로만 출력 (다른 설명 없이)
\`\`\`javascript
[
  { message: "...", before: "...", after: "...", verdictMessage: "...", triggers: [...] },
  ...
]
\`\`\``;

    console.log(`[${category}] ${count}개 메시지 생성 중...`);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 코드 블록 제거
        text = text.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');

        // JSON 파싱
        const messages = eval(text); // eval 사용 (개발용)

        console.log(`[${category}] ${messages.length}개 생성 완료`);
        return messages;

    } catch (error) {
        console.error(`[${category}] 생성 실패:`, error.message);
        return [];
    }
}

async function main() {
    console.log('=== 독설 메시지 900개 생성 시작 ===\n');

    const allMessages = {};

    // POSITIVE_STRONG: 170개 추가
    allMessages.POSITIVE_STRONG = await generateMessages(
        'POSITIVE_STRONG',
        170,
        '75~100점',
        '매우 긍정적, 확신에 찬 조언. "지금이 타이밍", "확실한 호감", "밀어붙여" 등'
    );

    await delay(2000); // Rate limit 방지

    // POSITIVE_MEDIUM: 180개 추가
    allMessages.POSITIVE_MEDIUM = await generateMessages(
        'POSITIVE_MEDIUM',
        180,
        '55~74점',
        '긍정적이지만 조심스러운 조언. "가능성 있음", "천천히", "조심스럽게" 등'
    );

    await delay(2000);

    // POSITIVE_SOFT: 135개 추가
    allMessages.POSITIVE_SOFT = await generateMessages(
        'POSITIVE_SOFT',
        135,
        '45~54점',
        '애매한 구간. "50:50", "판단 보류", "더 지켜봐" 등'
    );

    await delay(2000);

    // NEGATIVE_SOFT: 135개 추가
    allMessages.NEGATIVE_SOFT = await generateMessages(
        'NEGATIVE_SOFT',
        135,
        '30~44점',
        '부정적이지만 완전 거절은 아님. "에너지 없음", "관심도 낮음", "물러나" 등'
    );

    await delay(2000);

    // NEGATIVE_MEDIUM: 180개 추가
    allMessages.NEGATIVE_MEDIUM = await generateMessages(
        'NEGATIVE_MEDIUM',
        180,
        '15~29점',
        '확실히 부정적. "프레셔", "관심 없음", "포기해" 등'
    );

    await delay(2000);

    // NEGATIVE_STRONG: 180개 추가
    allMessages.NEGATIVE_STRONG = await generateMessages(
        'NEGATIVE_STRONG',
        180,
        '0~14점',
        '완전 거절. "읽씹 패턴", "우선순위 낮음", "인정해라" 등'
    );

    // 결과 저장
    const outputPath = './generated_messages.json';
    fs.writeFileSync(outputPath, JSON.stringify(allMessages, null, 2), 'utf-8');

    console.log(`\n=== 생성 완료 ===`);
    console.log(`총 ${Object.values(allMessages).flat().length}개 메시지 생성`);
    console.log(`저장 위치: ${outputPath}`);

    // 통계
    console.log('\n카테고리별 생성 개수:');
    for (const [category, messages] of Object.entries(allMessages)) {
        console.log(`  ${category}: ${messages.length}개`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 실행
main().catch(console.error);
