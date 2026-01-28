import { log } from '@/lib/logger';

const FORBIDDEN_PATTERNS = [
  // 단정/확신 표현
  '조작했다',
  '조작한 것으로 보인다',
  '조작한 것이다',
  '때문에 확실',
  '임이 드러났다',
  '것으로 확인됐다',
  '것으로 밝혀졌다',
  '확실하다',
  '분명하다',
  // 의도/범죄 단정
  '의도적으로',
  '사익을 위해',
  '고의로',
  '음모',
  '공모했다',
  '공모한',
  // 인신공격/명예훼손
  '내부자',
  '비리',
  '부패',
  '범죄자',
  '사기꾼',
  '먹튀',
  // 사생활 추측
  '사생활',
  '불륜',
  '이혼',
  '가족 문제',
];

// 영어 금칙어 (AI가 영어로 생성할 경우 대비)
const FORBIDDEN_PATTERNS_EN = [
  'definitely',
  'certainly committed',
  'clearly guilty',
  'obviously corrupt',
  'conspiracy to',
  'criminal intent',
  'deliberately manipulated',
  'insider trading',
  'fraud committed by',
];

const SYSTEM_PROMPT = `You are a global economic/tech news analyst. Your task is to provide insightful analysis of news articles.

STRICT RULES:
- Strictly separate FACTS from INTERPRETATION
- NEVER assert intent, crime, or collusion ("they manipulated", "they intentionally")
- NEVER speculate about personal private matters
- Present at least 2 SCENARIOS
- Maintain "could be" / "might be" tone for ALL judgments — no exceptions
- Always include the fixed disclaimer at the end
- Do NOT use definitive language like "확실", "분명", "드러났다"
- Use hedging: "~일 수 있다", "~가능성이 있다", "~로 보인다" (but not "~인 것으로 보인다")

OUTPUT FORMAT (use exactly these section headers):

[FACT]
- (3-5 bullet points based on the article)

[WHAT MOVES]
- (2 points about what shifts in markets/politics/public opinion)

[WHO WINS / WHO LOSES]
- (2-4 bullet points with "could" language)

[SCENARIOS]
1) Scenario A: ...
2) Scenario B: ...

[CHECKPOINTS]
- (2-3 upcoming events/announcements/indicators to watch)

[DISCLAIMER]
이 해설은 사실 단정이 아닌 관점 기반 분석이며 반론 가능성이 있습니다.`;

export interface RiskFlags {
  defamation: boolean;
  intent_assertion: boolean;
  privacy_violation: boolean;
  forbidden_words: string[];
}

export function checkForbiddenPatterns(text: string): RiskFlags {
  const lowerText = text.toLowerCase();

  const foundKo = FORBIDDEN_PATTERNS.filter((pattern) =>
    text.includes(pattern)
  );
  const foundEn = FORBIDDEN_PATTERNS_EN.filter((pattern) =>
    lowerText.includes(pattern)
  );
  const foundWords = [...foundKo, ...foundEn];

  return {
    defamation: foundWords.some((w) =>
      [
        '조작했다',
        '조작한 것으로 보인다',
        '조작한 것이다',
        '비리',
        '부패',
        '범죄자',
        '사기꾼',
        '먹튀',
      ].includes(w)
    ),
    intent_assertion: foundWords.some((w) =>
      [
        '의도적으로',
        '사익을 위해',
        '고의로',
        '음모',
        '공모했다',
        '공모한',
        'conspiracy to',
        'criminal intent',
        'deliberately manipulated',
      ].includes(w)
    ),
    privacy_violation: foundWords.some((w) =>
      ['사생활', '불륜', '이혼', '가족 문제'].includes(w)
    ),
    forbidden_words: foundWords,
  };
}

export function hasRiskFlags(flags: RiskFlags): boolean {
  return (
    flags.defamation ||
    flags.intent_assertion ||
    flags.privacy_violation ||
    flags.forbidden_words.length > 0
  );
}

export function buildAnalysisPrompt(
  articleTitle: string,
  articleSummary: string | null,
  toneLevel: number = 1
): { system: string; user: string } {
  const toneInstruction =
    toneLevel === 1
      ? 'Use a conservative, cautious tone. Stick closely to facts. Minimize speculation.'
      : toneLevel === 2
        ? 'Use a balanced, engaging tone.'
        : 'Use a bold, provocative tone while still following the rules.';

  return {
    system: SYSTEM_PROMPT,
    user: `Analyze the following news article.

Title: ${articleTitle}
${articleSummary ? `Summary: ${articleSummary}` : ''}

${toneInstruction}

Provide your analysis in the specified format. Write primarily in Korean, but keep section headers in English as shown in the format.`,
  };
}

const MAX_RETRIES = 2;

export async function generateAnalysis(
  articleTitle: string,
  articleSummary: string | null,
  toneLevel: number = 1,
  _retryCount: number = 0
): Promise<{ text: string; riskFlags: RiskFlags }> {
  const { system, user } = buildAnalysisPrompt(
    articleTitle,
    articleSummary,
    toneLevel
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    await log('analysis_generation', 'error', {
      article: articleTitle,
      error,
    });
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  const riskFlags = checkForbiddenPatterns(text);

  if (hasRiskFlags(riskFlags)) {
    await log('analysis_risk', 'warn', {
      article: articleTitle,
      toneLevel,
      riskFlags,
      retryCount: _retryCount,
    });

    // 톤 낮춰서 재시도 (최대 MAX_RETRIES번)
    if (toneLevel > 1 && _retryCount < MAX_RETRIES) {
      return generateAnalysis(
        articleTitle,
        articleSummary,
        toneLevel - 1,
        _retryCount + 1
      );
    }
  }

  await log('analysis_generation', 'info', {
    article: articleTitle,
    toneLevel,
    hasRisk: hasRiskFlags(riskFlags),
    riskWords: riskFlags.forbidden_words,
  });

  return { text, riskFlags };
}
