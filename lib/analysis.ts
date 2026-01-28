const FORBIDDEN_PATTERNS = [
  '조작했다',
  '조작한 것으로 보인다',
  '내부자',
  '비리',
  '부패',
  '때문에 확실',
  '임이 드러났다',
  '사익을 위해',
  '의도적으로',
];

const SYSTEM_PROMPT = `You are a global economic/tech news analyst. Your task is to provide insightful analysis of news articles.

RULES:
- Strictly separate FACTS from INTERPRETATION
- NEVER assert intent, crime, or collusion ("they manipulated", "they intentionally")
- NEVER speculate about personal private matters
- Present at least 2 SCENARIOS
- Maintain "could be" / "might be" tone for all judgments
- Always include the fixed disclaimer at the end

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
  const foundWords = FORBIDDEN_PATTERNS.filter((pattern) =>
    text.includes(pattern)
  );

  return {
    defamation: foundWords.some((w) =>
      ['조작했다', '조작한 것으로 보인다', '비리', '부패'].includes(w)
    ),
    intent_assertion: foundWords.some((w) =>
      ['의도적으로', '사익을 위해'].includes(w)
    ),
    privacy_violation: false,
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
  toneLevel: number = 2
): { system: string; user: string } {
  const toneInstruction =
    toneLevel === 1
      ? 'Use a conservative, cautious tone. Stick closely to facts.'
      : toneLevel === 3
        ? 'Use a bold, provocative tone while still following the rules.'
        : 'Use a balanced, engaging tone.';

  return {
    system: SYSTEM_PROMPT,
    user: `Analyze the following news article.

Title: ${articleTitle}
${articleSummary ? `Summary: ${articleSummary}` : ''}

${toneInstruction}

Provide your analysis in the specified format. Write primarily in Korean, but keep section headers in English as shown in the format.`,
  };
}

export async function generateAnalysis(
  articleTitle: string,
  articleSummary: string | null,
  toneLevel: number = 2
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
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  const riskFlags = checkForbiddenPatterns(text);

  // If risk flags found and tone > 1, suggest regeneration at lower tone
  if (hasRiskFlags(riskFlags) && toneLevel > 1) {
    return generateAnalysis(articleTitle, articleSummary, toneLevel - 1);
  }

  return { text, riskFlags };
}
