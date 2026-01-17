import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(request) {
    try {
        // 이미지 파일 받기
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json(
                { error: '이미지 파일이 없습니다' },
                { status: 400 }
            );
        }

        // 이미지를 base64로 변환
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Gemini Vision 모델 사용
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // 프롬프트: 대화 텍스트 추출
        const prompt = `이 카카오톡 대화 스크린샷에서 대화 내용을 추출해주세요.

**중요 규칙:**
1. 발신자를 구분해서 "상대:" 또는 "나:"로 표시
2. 각 메시지는 새 줄로 구분
3. 이모지도 그대로 포함
4. 타임스탬프나 읽음 표시는 제외
5. 순수하게 대화 내용만 추출

**출력 형식:**
상대: 첫 번째 메시지
나: 두 번째 메시지
상대: 세 번째 메시지

대화 내용만 출력하고 다른 설명은 하지 마세요.`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: imageFile.type,
            },
        };

        // API 호출
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const extractedText = response.text();

        // 추출된 텍스트 반환
        return NextResponse.json({
            success: true,
            chatText: extractedText.trim(),
            message: '대화 내용 추출 완료'
        });

    } catch (error) {
        console.error('[Gemini API Error]', error);

        return NextResponse.json(
            {
                success: false,
                error: '이미지 분석 실패',
                details: error.message
            },
            { status: 500 }
        );
    }
}
