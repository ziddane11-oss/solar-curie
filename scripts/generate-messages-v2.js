// 독설 메시지 생성 스크립트 v2 (개선판)
// 작은 배치로 나눠서 안전하게 생성

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'AIzaSyAreEOSoTrmZx68HxJdAhk0HLvFscUxCRA');

async function generateBatch(category, batchNum, count, scoreRange, tone, existingSamples) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `당신은 연애 대화 분석 전문가입니다. 카카오톡 대화를 분석하여 냉정하고 직설적인 독설/조언 메시지를 생성해주세요.

**카테고리**: ${category} (${scoreRange})
**배치**: #${batchNum}
**생성 개수**: ${count}개
**어조**: ${tone}

**기존 예시**:
${existingSamples}

**출력 형식**: 반드시 유효한 JSON 배열로만 응답하세요.
\`\`\`json
[
  {
    "message": "독설 내용 (구체적이고 직설적으로)",
    "before": "상대방 행동",
    "after": "상대방 심리",
    "verdictMessage": "판정 메시지",
    "triggers": ["패턴1", "패턴2"]
  }
]
\`\`\`

**트리거 종류**: "많은ㅋ", "이모지", "장문", "질문", "단답", "거부", "읽씹", "연속톡", "혼자떠듦"

**규칙**:
1. 기존 예시와 중복 금지
2. 실제 카톡 패턴 구체적으로 언급 (ㅋㅋㅋ 개수, 이모지, 답장 속도 등)
3. 냉정하지만 도움되는 조언
4. triggers는 해당되는 경우에만

**중요**: 반드시 유효한 JSON만 출력하세요.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 마크다운 코드 블록 제거
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // JSON 파싱
        const messages = JSON.parse(text);

        if (!Array.isArray(messages)) {
            throw new Error('응답이 배열이 아닙니다');
        }

        console.log(`  ✓ 배치 #${batchNum}: ${messages.length}개 생성`);
        return messages;

    } catch (error) {
        console.error(`  ✗ 배치 #${batchNum} 실패:`, error.message);
        console.log('  → 재시도합니다...');

        // 재시도 (1회)
        try {
            await delay(3000);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const messages = JSON.parse(text);
            console.log(`  ✓ 재시도 성공: ${messages.length}개`);
            return messages;
        } catch (retryError) {
            console.error(`  ✗ 재시도 실패`);
            return [];
        }
    }
}

async function generateCategory(category, target, scoreRange, tone, existingSamples) {
    console.log(`\n[${category}] ${target}개 생성 시작`);

    const allMessages = [];
    const batchSize = 50; // 한 번에 50개씩
    const batchCount = Math.ceil(target / batchSize);

    for (let i = 0; i < batchCount; i++) {
        const remaining = target - allMessages.length;
        const count = Math.min(batchSize, remaining);

        console.log(`  배치 ${i + 1}/${batchCount} (${count}개 요청)`);

        const batch = await generateBatch(
            category,
            i + 1,
            count,
            scoreRange,
            tone,
            existingSamples
        );

        allMessages.push(...batch);

        // Rate limit 방지
        if (i < batchCount - 1) {
            await delay(2000);
        }
    }

    console.log(`[${category}] 완료: 총 ${allMessages.length}/${target}개 생성`);
    return allMessages;
}

async function main() {
    console.log('=== 독설 메시지 900개 생성 (개선판) ===\n');

    const results = {};

    // POSITIVE_STRONG: 170개
    results.POSITIVE_STRONG = await generateCategory(
        'POSITIVE_STRONG',
        170,
        '75~100점',
        '매우 긍정적, 확신에 찬 조언',
        `예시: "지금 웃기지도 않은데 ㅋㅋㅋ 5개 쳤음. 너한테 잘 보이려고 웃고 있다는 뜻."`
    );

    // POSITIVE_MEDIUM: 180개
    results.POSITIVE_MEDIUM = await generateCategory(
        'POSITIVE_MEDIUM',
        180,
        '55~74점',
        '긍정적이지만 조심스러운 조언',
        `예시: "답장 빠름 + 질문 있음 = 관심 있다는 뜻. 밀어붙여도 됨."`
    );

    // POSITIVE_SOFT: 135개
    results.POSITIVE_SOFT = await generateCategory(
        'POSITIVE_SOFT',
        135,
        '45~54점',
        '애매한 구간, 판단 보류',
        `예시: "애매한 구간임. 가능성은 있는데 확신은 못 함."`
    );

    // NEGATIVE_SOFT: 135개
    results.NEGATIVE_SOFT = await generateCategory(
        'NEGATIVE_SOFT',
        135,
        '30~44점',
        '부정적이지만 완전 거절 아님',
        `예시: "답장은 하는데 에너지가 없음. 지금은 아닌 것 같은데?"`
    );

    // NEGATIVE_MEDIUM: 180개
    results.NEGATIVE_MEDIUM = await generateCategory(
        'NEGATIVE_MEDIUM',
        180,
        '15~29점',
        '확실히 부정적, 프레셔',
        `예시: "응 ㅋ은 감정 공백 상태임. 여기서 더 밀면 프레셔가 됨."`
    );

    // NEGATIVE_STRONG: 180개
    results.NEGATIVE_STRONG = await generateCategory(
        'NEGATIVE_STRONG',
        180,
        '0~14점',
        '완전 거절, 포기 권유',
        `예시: "읽씹이 2번 이상이면 패턴임. 바쁜 게 아니라 우선순위가 낮은 거임."`
    );

    // 저장
    const outputPath = path.join(__dirname, '../generated_messages.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

    console.log(`\n=== 생성 완료 ===`);
    const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`총 ${total}개 메시지 생성`);
    console.log(`저장: ${outputPath}`);

    // 통계
    console.log('\n카테고리별:');
    for (const [cat, msgs] of Object.entries(results)) {
        console.log(`  ${cat}: ${msgs.length}개`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
