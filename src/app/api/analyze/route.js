import { NextResponse } from 'next/server';

// Mock analysis for MVP - replace with GPT-4o Vision API later
const mockAnalyze = () => {
    const isHot = Math.random() > 0.4;

    if (isHot) {
        return {
            score: 70 + Math.floor(Math.random() * 30),
            type: 'hot',
            verdict: '불타오르는 중 🔥',
            keywords: [
                { text: '적극적', type: 'bubble', sentiment: 'positive' },
                { text: '관심폭발', type: 'bubble', sentiment: 'positive' },
                { text: '오늘각', type: 'bubble', sentiment: 'positive' },
                { text: '설렘가득', type: 'bubble', sentiment: 'positive' },
                { text: '유혹중', type: 'bubble', sentiment: 'positive' },
            ],
            secretMessage: '오늘 밤, 라면 먹고 갈래? 🍜',
            ads: [
                { name: '콘돔할인', icon: '🎁', link: '#' },
                { name: '야간모텔', icon: '🏨', link: '#' }
            ]
        };
    } else {
        return {
            score: 10 + Math.floor(Math.random() * 30),
            type: 'cold',
            verdict: '얼어붙음 🥶',
            keywords: [
                { text: '읽씹', type: 'brick', sentiment: 'negative' },
                { text: '철벽', type: 'brick', sentiment: 'negative' },
                { text: '어장관리', type: 'brick', sentiment: 'negative' },
                { text: 'ㅋ', type: 'brick', sentiment: 'negative' },
                { text: '관심없음', type: 'brick', sentiment: 'negative' },
            ],
            secretMessage: '손절각... 다른 사람 찾아볼까?',
            ads: [
                { name: '소개팅앱', icon: '💕', link: '#' },
                { name: '자기계발', icon: '📚', link: '#' }
            ]
        };
    }
};

export async function POST(request) {
    try {
        // In production, this would:
        // 1. Receive the uploaded image
        // 2. Send to GPT-4o Vision API
        // 3. Parse the response and return structured data

        // For MVP, return mock data
        const result = mockAnalyze();

        // Add artificial delay for loading effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Demo endpoint for testing
    const result = mockAnalyze();
    return NextResponse.json(result);
}
