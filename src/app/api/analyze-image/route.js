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

        // 프롬프트: 대화 텍스트, 시간, 스티커 추출
        const prompt = `이 카카오톡 대화 스크린샷을 분석해주세요.

**추출 항목**:
1. **대화 내용**: 발신자 구분하여 "상대:" 또는 "나:"로 표시
2. **시간 정보**: 메시지별 타임스탬프 (있는 경우만)
3. **스티커/이미지**: 이모티콘, 스티커, 사진 감지

**출력 형식**:
[시간] 상대: 메시지 내용
[시간] 나: 메시지 내용
[시간] 상대: [스티커:하트]
[시간] 나: [사진공유]

**시간 형식 예시**:
- [09:01] 또는 [오후 2:15] 등 화면에 표시된 그대로
- 시간 정보가 없으면 [시간] 생략

**스티커 감지**:
- 하트/좋아요 스티커 → [스티커:하트]
- 웃는 이모티콘 → [스티커:웃음]
- 슬픈/화난 이모티콘 → [스티커:슬픔] 또는 [스티커:화남]
- 사진/이미지 → [사진공유]

**규칙**:
1. 순수 대화 내용만 추출 (읽음 표시, 상태 메시지 제외)
2. 이모지는 그대로 포함
3. 발신자 구분 명확히

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
