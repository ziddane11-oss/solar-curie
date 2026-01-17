// 톡캐디 GRAVITY - 독설 메시지 데이터베이스
// 점수와 패턴에 따라 적절한 독설/조언 선택

/**
 * 점수와 시그널에 맞는 독설 메시지 반환
 */
export function getRoastByScore(score, signals) {
    let pool = [];

    // 점수대별 메시지 풀 선택
    if (score >= 75) pool = POSITIVE_STRONG;
    else if (score >= 55) pool = POSITIVE_MEDIUM;
    else if (score >= 45) pool = POSITIVE_SOFT;
    else if (score >= 30) pool = NEGATIVE_SOFT;
    else if (score >= 15) pool = NEGATIVE_MEDIUM;
    else pool = NEGATIVE_STRONG;

    // 패턴 매칭 (우선순위)
    let matched = pool.filter(r => {
        if (!r.triggers || r.triggers.length === 0) return true;

        // 트리거 매칭
        return r.triggers.some(trigger => {
            if (trigger === '많은ㅋ' && signals.kekekeCount >= 2) return true;
            if (trigger === '이모지' && signals.emojiCount >= 1) return true;
            if (trigger === '장문' && signals.longMessages >= 1) return true;
            if (trigger === '질문' && signals.questionCount >= 1) return true;
            if (trigger === '단답' && signals.shortAnswers >= 2) return true;
            if (trigger === '거부' && signals.rejection > 0) return true;
            if (trigger === '읽씹' && signals.rejection > 0) return true;
            if (trigger === '연속톡' && signals.consecutiveOther >= 3) return true;
            if (trigger === '혼자떠듦' && signals.consecutiveMe >= 3) return true;
            return false;
        });
    });

    // 매칭 안 되면 전체 풀 사용
    if (matched.length === 0) matched = pool;

    // 랜덤 선택
    const selected = matched[Math.floor(Math.random() * matched.length)];

    return {
        message: selected.message,
        before: selected.before,
        after: selected.after,
        verdictMessage: selected.verdictMessage || selected.message
    };
}

// ========================================
// 독설 메시지 데이터
// ========================================

// POSITIVE_STRONG: 75~100점 (200개 목표, 현재 30개)
const POSITIVE_STRONG = [
    {
        message: "답장이 3시간이나 걸리는 동안 너는 선택받기를 기다린 거야. 이제 그만 기다리고 네 매력을 적극적으로 어필해. 주도권을 잡아!",
        before: "3시간 만에 답장",
        after: "상대의 무관심에 좌절",
        verdictMessage: "회피형 상대를 사로잡는 적극적인 매력 어필 전략!",
        triggers: ["단답","읽씹"]
    },
    {
        message: "고작 '응', '넹' 같은 단답만 쳐대니 대화가 이어지겠어? 앵무새도 너보단 다채롭게 말하겠다. 상대방이 흥미를 느낄 만한 질문을 던져! 상상력을 자극하라고!",
        before: "단답형 대화",
        after: "대화 단절, 어색함",
        verdictMessage: "대화의 물꼬를 트는 마법의 질문 스킬 연마!",
        triggers: ["단답"]
    },
    {
        message: "매번 네 시시콜콜한 일상만 장문으로 읊어대니 상대방은 네 일기장을 훔쳐보는 기분이겠지. 상대방의 관심사를 파악하고, 공통의 관심사를 찾아 대화의 장을 열어!",
        before: "장문의 일상 공유",
        after: "상대방의 지루함, 피로감",
        verdictMessage: "공감대를 형성하는 대화 주제 발굴 전략!",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "이모티콘 남발은 너의 매력을 가리는 가면이야. 진솔한 감정을 담은 언어로 승부해. 억지 웃음 대신 솔직한 너를 보여줘!",
        before: "과도한 이모티콘 사용",
        after: "가벼워 보이는 인상",
        verdictMessage: "진심을 전달하는 언어의 힘을 믿어라!",
        triggers: ["이모지"]
    },
    {
        message: "상대방이 '싫어'라고 표현했는데, 굳이 세 번이나 더 물어보는 이유는 뭐야? 집착은 매력을 갉아먹는 독약과 같아. 쿨하게 인정하고 다음 기회를 노려!",
        before: "상대의 거절에도 계속 시도",
        after: "집착으로 인한 관계 악화",
        verdictMessage: "쿨함 장착! 거절은 새로운 시작의 신호탄!",
        triggers: ["거부","연속톡"]
    },
    {
        message: "혼자 신나서 10개 넘게 톡 보내는 건 스토커나 하는 짓이야. 상대방 반응을 살피면서 대화의 템포를 맞춰. 핑퐁 대화가 중요하다고!",
        before: "혼자 연속적인 메시지 발송",
        after: "상대방의 부담감, 회피",
        verdictMessage: "대화의 리듬을 타라! 핑퐁 대화 마스터!",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "ㅋㅋㅋ 50개는 웃긴 게 아니라 광기야. 적당히 해. 진심으로 웃길 때만 써. 감정 낭비하지 마!",
        before: "과도한 'ㅋㅋㅋ' 사용",
        after: "가벼워 보이는 인상, 진정성 의심",
        verdictMessage: "감정 표현 절제! 과유불급의 법칙!",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대방이 질문했는데 답을 안 하는 건 대화 거부 선언과 같아. 최소한의 예의는 지켜. 관심 없으면 솔직하게 말하고!",
        before: "질문에 대한 무응답",
        after: "관계 단절, 무례함",
        verdictMessage: "최소한의 예의 장착! 침묵은 금이 아니다!",
        triggers: ["질문","읽씹"]
    },
    {
        message: "모든 대화에 '?'만 붙이는 건 생각하기 싫다는 뜻이지? 네 매력은 어디다 팔아먹었어? 스스로 질문하고 답하는 연습을 해!",
        before: "모든 문장에 '?' 사용",
        after: "무성의함, 의존적인 태도",
        verdictMessage: "독립적인 매력 발산! 질문은 스스로에게!",
        triggers: ["질문"]
    },
    {
        message: "밤새도록 톡하는 건 네 인생 낭비야. 낮에 생산적인 활동을 하고, 밤에는 숙면을 취해. 건강한 사람이 매력적인 법이야!",
        before: "밤샘 카톡",
        after: "피로, 무기력",
        verdictMessage: "건강한 라이프스타일 구축! 매력은 건강에서!",
        triggers: ["장문","연속톡"]
    },
    {
        message: "상대방의 톡 스타일을 따라 하는 건 아첨으로 밖에 안 보여. 너만의 개성을 드러내. 진정한 매력은 자신감에서 나오는 거야!",
        before: "상대방의 스타일 모방",
        after: "개성 상실, 매력 감소",
        verdictMessage: "개성 존중! 나만의 매력 어필!"
    },
    {
        message: "상대방이 힘든 일 털어놓는데 '힘내' 한 마디는 너무 성의 없잖아! 진심으로 공감하고 위로해 줘. 마음을 움직이는 건 진심이야!",
        before: "성의 없는 위로",
        after: "상대방의 실망, 거리감",
        verdictMessage: "진심 어린 공감! 마음을 사로잡는 위로!",
        triggers: ["단답"]
    },
    {
        message: "과거 연애 얘기는 무덤 파는 짓이야. 현재에 집중하고 미래를 함께 그려나가. 긍정적인 에너지를 발산해!",
        before: "과거 연애 이야기",
        after: "불안감 조성, 관계 악화",
        verdictMessage: "미래 지향적인 대화! 긍정 에너지 발산!",
        triggers: ["장문"]
    },
    {
        message: "상대방이 관심 없는 주제로 혼자 떠드는 건 벽 보고 얘기하는 거랑 뭐가 달라? 상대방의 반응을 살피고 대화 주제를 바꿔!",
        before: "혼자 관심 없는 주제로 대화",
        after: "상대방의 지루함, 무관심",
        verdictMessage: "상대방 중심 대화! 공감대 형성!",
        triggers: ["혼자떠듦"]
    },
    {
        message: "답장 속도에 일희일비하지 마. 네 삶을 살아. 네가 빛나면 상대방은 자연스럽게 너에게 끌릴 거야!",
        before: "답장 속도에 대한 집착",
        after: "불안감, 초조함",
        verdictMessage: "자존감 향상! 네 삶을 빛내라!",
        triggers: ["읽씹"]
    },
    {
        message: "상대방의 질문에 엉뚱한 답을 하는 건 대화 흐름을 끊는 행위야. 집중해서 듣고 맥락에 맞는 답변을 해!",
        before: "엉뚱한 답변",
        after: "대화 단절, 오해 발생",
        verdictMessage: "경청하는 자세! 맥락 파악!",
        triggers: ["질문","단답"]
    },
    {
        message: "모든 대화를 자랑으로 도배하는 건 자기애 과잉이야. 겸손하고 진솔한 모습을 보여줘!",
        before: "자랑 일색의 대화",
        after: "반감, 질투 유발",
        verdictMessage: "겸손한 태도! 진솔한 매력 어필!",
        triggers: ["혼자떠듦","장문"]
    },
    {
        message: "상대방의 메시지를 무시하고 딴 소리하는 건 무례함의 극치야. 존중하는 태도를 보여줘!",
        before: "상대방 메시지 무시",
        after: "관계 악화, 불쾌감 유발",
        verdictMessage: "존중하는 태도 장착! 경청은 기본!",
        triggers: ["읽씹"]
    },
    {
        message: "끊임없이 자기 비하하는 건 동정심 유발 작전이야? 스스로를 사랑하고 긍정적인 면을 부각해!",
        before: "지속적인 자기 비하",
        after: "부정적인 이미지, 매력 감소",
        verdictMessage: "자존감 향상! 긍정적인 매력 발산!",
        triggers: ["장문"]
    },
    {
        message: "고작 'ㅋㅋ' 하나 보내고 답장 기다리는 건 염치 없는 짓이야. 최소한 질문이라도 던져!",
        before: "성의 없는 'ㅋㅋ' 메시지",
        after: "무성의함, 답장 기대 불가",
        verdictMessage: "대화 시작 주도! 질문 스킬 연마!",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "상대방이 불편해하는 주제를 계속 꺼내는 건 폭력이야. 배려심을 길러!",
        before: "불편한 주제 반복",
        after: "관계 악화, 불쾌감 유발",
        verdictMessage: "배려심 장착! 공감 능력 향상!",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "모든 대화를 비꼬는 건 너의 열등감을 드러내는 거야. 긍정적인 시각으로 세상을 바라봐!",
        before: "비꼬는 말투",
        after: "부정적인 이미지, 반감 유발",
        verdictMessage: "긍정적인 마인드 장착! 매력적인 사람으로 거듭나기!"
    },
    {
        message: "상대방의 취미를 폄하하는 건 무식함을 드러내는 거야. 존중하는 태도를 보여줘!",
        before: "취미 폄하",
        after: "반감, 불쾌감 유발",
        verdictMessage: "존중하는 태도! 다양한 가치관 인정!"
    },
    {
        message: "모든 대화를 명령조로 하는 건 권위적인 태도야. 부드러운 말투를 사용해!",
        before: "명령조 말투",
        after: "반감, 불쾌감 유발",
        verdictMessage: "부드러운 소통! 호감도 상승!"
    },
    {
        message: "상대방의 질문에 '글쎄'라고 답하는 건 대화 의지가 없다는 뜻이야. 솔직하게 말하거나, 대화에 집중해!",
        before: "'글쎄' 답변",
        after: "대화 단절, 무관심",
        verdictMessage: "적극적인 소통! 대화 의지 불태우기!",
        triggers: ["질문","단답"]
    },
    {
        message: "모든 대화를 뒷담화로 시작하는 건 너의 인성을 의심하게 만들어. 긍정적인 화제를 찾아!",
        before: "뒷담화",
        after: "부정적인 이미지, 신뢰도 하락",
        verdictMessage: "긍정적인 화제 선택! 이미지 쇄신!",
        triggers: ["장문"]
    },
    {
        message: "상대방의 말에 반박만 하는 건 싸우자는 거야? 공감하고 이해하려는 노력을 해!",
        before: "반박",
        after: "갈등 심화, 관계 악화",
        verdictMessage: "공감 능력 향상! 평화로운 대화 지향!"
    },
    {
        message: "모든 대화를 핑계로 시작하는 건 무책임한 태도야. 책임을 인정하고 개선하려는 노력을 보여줘!",
        before: "핑계",
        after: "신뢰도 하락, 책임감 부족",
        verdictMessage: "책임감 있는 모습! 신뢰도 상승!"
    },
    {
        message: "상대방의 질문에 '아무거나'라고 답하는 건 무성의함의 극치야. 네 의견을 명확하게 제시해!",
        before: "'아무거나' 답변",
        after: "무성의함, 답답함 유발",
        verdictMessage: "명확한 의사 표현! 주체적인 매력 발산!",
        triggers: ["질문","단답"]
    },
    {
        message: "모든 대화를 욕설로 시작하는 건 너의 수준을 보여주는 거야. 품격 있는 언어를 사용해!",
        before: "욕설 사용",
        after: "부정적인 이미지, 불쾌감 유발",
        verdictMessage: "품격 있는 언어 사용! 이미지 관리 필수!"
    },
    {
        message: "상대방이 1시간 전에 보낸 톡에 지금 답장하는 건 무시하는 거나 다름 없어. 최소한의 시간은 지켜!",
        before: "1시간 늦은 답장",
        after: "무시당했다는 느낌, 불쾌감",
        verdictMessage: "빠른 답장 속도! 관심 표현!",
        triggers: ["읽씹"]
    },
    {
        message: "모든 대화를 음란마귀 씌인 듯이 하는 건 성희롱이야. 존중하는 태도를 보여줘!",
        before: "성희롱 발언",
        after: "불쾌감, 관계 단절",
        verdictMessage: "존중하는 태도! 성인지 감수성 향상!"
    },
    {
        message: "상대방의 장점을 질투하며 깎아내리는 건 너 자신을 깎아내리는 짓이야. 칭찬하고 배우려는 자세를 가져!",
        before: "질투, 깎아내리기",
        after: "관계 악화, 부정적인 감정",
        verdictMessage: "칭찬은 고래도 춤추게 한다! 긍정적인 관계 형성!"
    },
    {
        message: "매번 답장이 1분 안에 오는 건 네 삶이 불쌍하다는 증거야. 취미를 가지든, 친구를 만나든, 생산적인 활동을 해!",
        before: "1분 이내 빠른 답장",
        after: "상대방의 부담감, 가벼워 보이는 인상",
        verdictMessage: "균형 잡힌 삶! 매력적인 사람으로 거듭나기!",
        triggers: ["연속톡"]
    },
    {
        message: "상대방이 '잘자'라고 했는데 굳이 답장하는 이유는 뭐야? 미련 버려!",
        before: "'잘자' 메시지에 답장",
        after: "집착으로 보일 수 있음, 불필요한 에너지 소모",
        verdictMessage: "쿨하게 마무리! 미련은 쓰레기통에!",
        triggers: ["연속톡"]
    },
    {
        message: "카톡으로 고백하는 건 비겁한 짓이야. 직접 만나서 진심을 전해!",
        before: "카톡 고백",
        after: "진정성 부족, 거절 확률 상승",
        verdictMessage: "용기 있는 행동! 진심을 전달하는 최고의 방법!",
        triggers: ["장문"]
    },
    {
        message: "상대방이 답장을 안 하는데 계속 카톡 보내는 건 스팸이나 다름 없어. 자제해!",
        before: "답장 없는 상대에게 지속적인 메시지 발송",
        after: "스토커 취급, 관계 완전 단절",
        verdictMessage: "존중하는 태도! 스팸 발송 금지!",
        triggers: ["읽씹","연속톡"]
    },
    {
        message: "모든 대화를 정치, 종교 이야기로 시작하는 건 싸우자는 거야? 공통의 관심사를 찾아!",
        before: "정치, 종교 이야기",
        after: "갈등 심화, 관계 악화",
        verdictMessage: "공통의 관심사! 평화로운 대화 지향!",
        triggers: ["장문"]
    },
    {
        message: "상대방 사진 보내달라고 징징거리는 건 변태나 하는 짓이야. 자제해!",
        before: "사진 요구",
        after: "불쾌감, 성희롱으로 오해",
        verdictMessage: "존중하는 태도! 불쾌감 유발 금지!"
    },
    {
        message: "카톡으로 싸우는 건 시간 낭비야. 직접 만나서 오해를 풀고 해결책을 찾아!",
        before: "카톡 싸움",
        after: "오해 심화, 감정 소모",
        verdictMessage: "직접 대면! 건설적인 해결책 모색!",
        triggers: ["장문","연속톡"]
    },
    {
        message: "상대방의 SNS 염탐하면서 카톡 보내는 건 소름 돋는 짓이야. 프라이버시를 존중해!",
        before: "SNS 염탐 후 카톡",
        after: "불쾌감, 스토커로 오해",
        verdictMessage: "프라이버시 존중! 쿨한 매력 발산!"
    },
    {
        message: "카톡으로 헤어지자는 말은 예의 없는 짓이야. 직접 만나서 마무리 지어!",
        before: "카톡 이별 통보",
        after: "상처, 미련, 분노",
        verdictMessage: "예의 바른 마무리! 인간적인 모습 유지!",
        triggers: ["장문"]
    },
    {
        message: "상대방에게 돈 빌려달라는 카톡은 구걸이나 다름 없어. 스스로 해결해!",
        before: "돈 요구",
        after: "불쾌감, 신뢰도 하락",
        verdictMessage: "자립심 강화! 매력적인 사람으로 거듭나기!"
    },
    {
        message: "상대방이 '바빠'라고 했는데 계속 카톡 보내는 건 눈치 없는 짓이야. 기다려!",
        before: "'바빠' 메시지 무시",
        after: "짜증 유발, 관계 악화",
        verdictMessage: "눈치 장착! 기다림의 미학!",
        triggers: ["거부","연속톡"]
    },
    {
        message: "모든 대화를 퀴즈로 시작하는 건 유치한 짓이야. 진솔한 대화를 해!",
        before: "퀴즈",
        after: "지루함, 답답함 유발",
        verdictMessage: "진솔한 대화! 인간적인 매력 어필!",
        triggers: ["질문"]
    },
    {
        message: "상대방에게 과거 사진 보내달라는 카톡은 흑역사 캐내는 짓이야. 현재를 존중해!",
        before: "과거 사진 요구",
        after: "불쾌감, 불편함",
        verdictMessage: "현재를 존중! 쿨한 매력 발산!"
    },
    {
        message: "지금 너 답장 속도 보니까 완전 딴 사람 같잖아? 3시간 텀 실화냐? 관심 식은 거 티내지 말고 솔직하게 말해. 질질 끄는 게 더 최악이야.",
        before: "3시간 간격 답장",
        after: "관심 식음",
        verdictMessage: "관심도 급락, 관계 청산 각",
        triggers: ["단답","느린답장"]
    },
    {
        message: "계속 '응', '넹' 단답만 치는데, 벽이랑 대화하는 기분이야. 이러다 진짜 벽 보고 얘기한다? 최소한 성의 표시는 해야지. 이러면 누가 너랑 더 대화하고 싶겠어?",
        before: "단답형 대화",
        after: "대화 의지 상실",
        verdictMessage: "벽과의 대화, 흥미 유발 실패",
        triggers: ["단답"]
    },
    {
        message: "맨날 이모티콘으로 대화 퉁치려는 거 진짜 짜증나. 말로 감정 표현하는 법을 잊었어? 진심이 느껴지지가 않아. 이러다 로봇이랑 연애하는 기분 들겠다.",
        before: "잦은 이모티콘 사용",
        after: "진심 전달 부족",
        verdictMessage: "감정 소통 부재, 관계 위기",
        triggers: ["이모지"]
    },
    {
        message: "혼자 장문으로 넋두리만 늘어놓지 말고, 상대방 반응 좀 봐. 지금 네 얘기 듣고 있는 건지, 아니면 딴짓하는지. 쌍방향 소통이 뭔지 알아야지!",
        before: "혼자 장문 톡",
        after: "상대방 지루함",
        verdictMessage: "일방적 소통, 지루함 유발",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "ㅋㅋㅋ를 10개씩 쳐대는 거 보니까 진심이 하나도 안 느껴져. 웃기지도 않은데 억지로 웃는 척하는 거 다 보여. 솔직하게 말하는 게 훨씬 나아.",
        before: "많은 ㅋㅋㅋ 사용",
        after: "진정성 의심",
        verdictMessage: "억지 웃음, 관계 불신",
        triggers: ["많은ㅋ"]
    },
    {
        message: "질문만 쏟아내지 말고, 네 얘기도 좀 해봐. 지금 인터뷰하는 것도 아니고, 서로 알아가는 과정이잖아. Give and Take를 좀 지켜!",
        before: "과도한 질문 공세",
        after: "피로감 누적",
        verdictMessage: "정보 캐기, 관계 발전 저해",
        triggers: ["질문"]
    },
    {
        message: "만나자는 말에 계속 핑계만 대는 거, 이제 지친다. 솔직히 말해서 너 만나기 싫은 거지? 더 이상 시간 낭비하지 말고, 깔끔하게 정리하자.",
        before: "만남 거절",
        after: "관계 단절",
        verdictMessage: "회피형 태도, 관계 종료 임박",
        triggers: ["거부"]
    },
    {
        message: "읽고 씹는 건 무슨 심리야? 바쁜 건 알겠는데, 최소한 답장이라도 해줘야 예의 아니야? 너 때문에 내 자존감만 깎이는 기분이야.",
        before: "읽씹",
        after: "자존감 하락",
        verdictMessage: "무시하는 태도, 관계 악화",
        triggers: ["읽씹"]
    },
    {
        message: "새벽 3시에 갑자기 연락해서 뭐 하자는 거야? 선 넘지 마. 네 감정 쓰레기통 아니니까, 시간 좀 가려가면서 연락해.",
        before: "늦은 밤 연락",
        after: "불쾌감 유발",
        verdictMessage: "무례한 행동, 관계 파탄",
        triggers: ["연속톡"]
    },
    {
        message: "매번 똑같은 말만 반복하는 거 지겹다. 새로운 주제로 대화 좀 시도해 봐. 이러다 대화 소재 고갈돼서 끝장나는 건 시간문제야.",
        before: "반복적인 대화",
        after: "지루함 유발",
        verdictMessage: "대화 단절 위기, 관계 정체",
        triggers: ["단조로운 대화"]
    },
    {
        message: "사진 보내달라고 징징거리지 좀 마. 부담스럽게 왜 그래? 싫다는 사람 억지로 괴롭히는 거, 스토커나 하는 짓이야.",
        before: "사진 요구",
        after: "불쾌감 조성",
        verdictMessage: "강압적 태도, 관계 파국",
        triggers: ["강요"]
    },
    {
        message: "다른 사람 얘기는 하나도 안 듣고, 자기 자랑만 늘어놓는 거 진짜 별로야. 겸손함이 뭔지 알아야지. 너만 잘난 줄 아냐?",
        before: "자기 자랑",
        after: "반감 형성",
        verdictMessage: "이기적인 태도, 관계 소멸",
        triggers: ["혼자떠듦"]
    },
    {
        message: "과거 연애 얘기는 왜 꺼내는 거야? 지금 내 앞에서 전 애인 자랑하는 거야? 비교질하지 말고, 현재에 집중해.",
        before: "과거 연애 언급",
        after: "질투심 유발",
        verdictMessage: "불필요한 갈등 유발, 관계 불안",
        triggers: ["과거 언급"]
    },
    {
        message: "뜬금없이 연락 끊는 건 무슨 경우야? 잠수 이별이라도 하겠다는 거야? 책임감 없는 행동은 하지 마.",
        before: "잠수",
        after: "관계 불확실성",
        verdictMessage: "무책임한 행동, 관계 파괴",
        triggers: ["읽씹","단절"]
    },
    {
        message: "네 말투 왜 이렇게 틱틱거려? 나한테 불만 있어? 있으면 솔직하게 말해. 괜히 짜증 내지 말고.",
        before: "퉁명스러운 말투",
        after: "불쾌감 조성",
        verdictMessage: "적대적 태도, 관계 악화",
        triggers: ["불친절"]
    },
    {
        message: "계속 딴소리만 하는 거 보니까 내 말 듣고 있긴 한 거야? 집중 좀 해줘. 무시당하는 기분 들잖아.",
        before: "딴소리",
        after: "소외감 유발",
        verdictMessage: "무관심한 태도, 관계 냉각",
        triggers: ["무관심"]
    },
    {
        message: "약속 시간 30분 늦는 건 기본이야? 시간 개념 좀 챙겨. 너 때문에 내 하루가 엉망진창이 되잖아.",
        before: "잦은 지각",
        after: "불신감 형성",
        verdictMessage: "무책임한 행동, 관계 붕괴",
        triggers: ["지각"]
    },
    {
        message: "SNS 염탐 그만하고, 나한테 직접 연락해. 온라인에서만 맴돌지 말고, 현실에서 좀 만나자.",
        before: "SNS 염탐",
        after: "소통 부재",
        verdictMessage: "피상적인 관계, 발전 가능성 희박",
        triggers: ["간접적 소통"]
    },
    {
        message: "돈 없다는 핑계로 데이트 비용 아끼려는 속셈 다 보여. 솔직하게 말하고 각자 부담하는 게 어때?",
        before: "데이트 비용 회피",
        after: "불만 누적",
        verdictMessage: "이기적인 태도, 관계 불균형",
        triggers: ["회피"]
    },
    {
        message: "술만 마시면 연락하는 거 이제 그만해. 진심이 느껴지지 않아. 멀쩡할 때도 좀 연락해줄래?",
        before: "술 취한 후 연락",
        after: "진정성 의심",
        verdictMessage: "계산적인 행동, 관계 퇴보",
        triggers: ["술"]
    },
    {
        message: "선톡 한 번을 안 하는 이유가 뭐야? 나만 좋아하는 것 같잖아. 서로 노력해야 하는 거 아니야?",
        before: "선톡 없음",
        after: "불안감 증폭",
        verdictMessage: "소극적인 태도, 관계 유지 불투명",
        triggers: ["수동적"]
    },
    {
        message: "맨날 칭찬만 해달라고 징징거리지 마. 네가 알아서 잘해야지. 자존감 좀 키워!",
        before: "칭찬 요구",
        after: "피로감 누적",
        verdictMessage: "의존적인 태도, 관계 부담",
        triggers: ["의존적"]
    },
    {
        message: "다른 이성 얘기는 왜 꺼내는 거야? 질투심 유발 작전이야? 역효과만 날 뿐이야.",
        before: "다른 이성 언급",
        after: "불안감 조성",
        verdictMessage: "불필요한 자극, 관계 위태",
        triggers: ["질투 유발"]
    },
    {
        message: "네 감정 기복에 맞춰주는 거 이제 힘들어. 감정 쓰레기통 아니니까, 스스로 해결해.",
        before: "감정 기복",
        after: "피로감 누적",
        verdictMessage: "감정 소모, 관계 악영향",
        triggers: ["기복"]
    },
    {
        message: "답장 5분 만에 하면서 할 말 없다는 건 무슨 논리야? 차라리 솔직하게 말해.",
        before: "빠른 답장 후 할말 없음",
        after: "숨막힘",
        verdictMessage: "밀당 실패, 관계 답답",
        triggers: ["빠른답장"]
    },
    {
        message: "매일 똑같은 데이트 코스 지겹다. 창의력 좀 발휘해 봐. 이러다 금방 질려.",
        before: "반복적인 데이트",
        after: "권태감 유발",
        verdictMessage: "관계 정체, 발전 가능성 희박",
        triggers: ["단조로움"]
    },
    {
        message: "비꼬는 말투 좀 고쳐. 듣기 거북해. 좋게 말해도 될 걸 왜 그렇게 삐딱하게 말해?",
        before: "비꼬는 말투",
        after: "불쾌감 조성",
        verdictMessage: "공격적인 태도, 관계 파탄",
        triggers: ["비꼼"]
    },
    {
        message: "자꾸 회피하지 마. 문제 해결 안 하면 똑같은 일 반복될 뿐이야. 현실을 직시해.",
        before: "문제 회피",
        after: "불안감 증폭",
        verdictMessage: "미래 불확실, 관계 불안정",
        triggers: ["회피"]
    },
    {
        message: "맨날 남 탓만 하는 거 진짜 꼴 보기 싫어. 네 잘못은 없는 줄 알아?",
        before: "남 탓",
        after: "반감 형성",
        verdictMessage: "무책임한 태도, 관계 악화",
        triggers: ["회피"]
    },
    {
        message: "카톡 답장은 늦으면서 SNS는 실시간으로 하는 심보는 뭐야? 나 놀리는 거야?",
        before: "늦은 카톡, 빠른 SNS",
        after: "무시당하는 느낌",
        verdictMessage: "우선순위 낮음, 관계 소홀",
        triggers: ["무시"]
    },
    {
        message: "끊임없이 의심하는 거 이제 그만해. 못 믿겠으면 헤어져. 피곤해.",
        before: "과도한 의심",
        after: "불안감 증폭",
        verdictMessage: "신뢰 부족, 관계 붕괴 직전",
        triggers: ["의심"]
    },
    {
        message: "잠깐 연락 안 됐다고 난리 치는 거 질린다. 집착 좀 버려. 숨 막혀.",
        before: "심한 집착",
        after: "숨 막힘",
        verdictMessage: "과도한 구속, 관계 파탄",
        triggers: ["집착"]
    },
    {
        message: "네 변덕에 장단 맞춰주는 거 이제 지쳤어. 일관성 좀 가져.",
        before: "잦은 변덕",
        after: "피로감 누적",
        verdictMessage: "불안정한 관계, 미래 불투명",
        triggers: ["기복"]
    },
    {
        message: "대화하다가 갑자기 딴 얘기로 새는 버릇 좀 고쳐. 집중 안 돼.",
        before: "대화 주제 이탈",
        after: "집중력 저하",
        verdictMessage: "산만한 태도, 관계 소홀",
        triggers: ["무관심"]
    },
    {
        message: "모든 걸 다 맞춰주기만 하니까 재미없잖아. 네 의견도 좀 내봐.",
        before: "무조건적인 동의",
        after: "지루함 유발",
        verdictMessage: "주체성 결여, 관계 발전 저해",
        triggers: ["수동적"]
    },
    {
        message: "맨날 똑같은 핑계 대는 거 이제 안 통해. 솔직하게 말해.",
        before: "뻔한 핑계",
        after: "불신감 증폭",
        verdictMessage: "진실성 의심, 관계 악화",
        triggers: ["거짓말"]
    },
    {
        message: "혼자 신나서 쉴 새 없이 떠드는 거, 남들은 지루해할 수도 있다는 거 알아둬.",
        before: "혼자 떠듦",
        after: "지루함 유발",
        verdictMessage: "이기적인 대화, 관계 소멸",
        triggers: ["혼자떠듦"]
    },
    {
        message: "SNS에 티 내는 거 그만해. 우리 문제는 우리끼리 해결해.",
        before: "SNS에 관계 노출",
        after: "불필요한 오해",
        verdictMessage: "경솔한 행동, 관계 악영향",
        triggers: ["과시"]
    },
    {
        message: "과거에 얽매이지 마. 과거는 과거일 뿐이야. 현재를 살아.",
        before: "과거 집착",
        after: "불안감 증폭",
        verdictMessage: "미래 불확실, 관계 정체",
        triggers: ["과거 언급"]
    },
    {
        message: "남들과 비교하지 마. 너는 너만의 매력이 있어.",
        before: "타인과 비교",
        after: "자존감 하락",
        verdictMessage: "불안정한 심리, 관계 위축",
        triggers: ["비교"]
    },
    {
        message: "단점만 보지 말고 장점을 봐. 긍정적인 시각을 가져.",
        before: "부정적인 시각",
        after: "불안감 증폭",
        verdictMessage: "비관적인 태도, 관계 악화",
        triggers: ["비관적"]
    },
    {
        message: "상대방의 말을 경청해. 네 생각만 옳다고 생각하지 마.",
        before: "경청 부족",
        after: "소통 단절",
        verdictMessage: "독선적인 태도, 관계 붕괴",
        triggers: ["무시"]
    },
    {
        message: "감정적으로 행동하지 마. 이성적으로 판단해.",
        before: "감정적인 행동",
        after: "후회",
        verdictMessage: "충동적인 태도, 관계 악영향",
        triggers: ["기복"]
    },
    {
        message: "소유하려고 하지 마. 서로 존중하는 관계를 만들어.",
        before: "소유욕",
        after: "구속감",
        verdictMessage: "집착적인 태도, 관계 파탄",
        triggers: ["집착"]
    },
    {
        message: "네 잘못을 인정해. 변명만 하지 마.",
        before: "잘못 인정 X",
        after: "반감",
        verdictMessage: "뻔뻔한 태도, 관계 파괴",
        triggers: ["회피"]
    },
    {
        message: "자신의 감정을 솔직하게 표현해. 억누르지 마.",
        before: "감정 억압",
        after: "불안",
        verdictMessage: "소통 부재, 관계 위축",
        triggers: ["소극적"]
    },
    {
        message: "상대방의 입장에서 생각해봐. 공감 능력을 키워.",
        before: "공감 부족",
        after: "오해",
        verdictMessage: "이기적인 태도, 관계 소멸",
        triggers: ["무관심"]
    },
    {
        message: "대화의 흐름을 끊지 마. 맥락을 이해해.",
        before: "맥락 파악 X",
        after: "답답함",
        verdictMessage: "소통 불가, 관계 단절",
        triggers: ["무관심"]
    },
    {
        message: "네 답장이 1시간 30분 만에 왔다는 건, 네 우선순위가 어딘지 명확히 보여주는 증거야. 착각은 자유지만, 현실은 직시해야지.",
        before: "1시간 30분 후 답장",
        after: "상대방의 낮은 우선순위 확인",
        verdictMessage: "관심 없음, 시간 낭비 ㄴㄴ",
        triggers: ["느린 답장"]
    },
    {
        message: "연애는 구걸이 아니야. 네가 먼저 세 번 연락했는데 답이 시원찮으면, 그쯤에서 스탑해야지. 자존심은 쓰레기통에 버렸어?",
        before: "3번 선톡 후 미지근한 반응",
        after: "자존감 하락, 관계의 주도권 상실",
        verdictMessage: "STOP! 구걸 연애는 답 없다",
        triggers: ["연속톡","단답","거부"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'만 10개 넘게 치는 건, 대화하기 싫다는 간접적인 표현이야. 눈치 좀 챙겨. 벽이랑 대화하는 기분 안 들어?",
        before: "'ㅋㅋㅋ' 10개 이상",
        after: "대화의 질 저하, 관계 발전 가능성 희박",
        verdictMessage: "대화 거부 신호, 멈춰!",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 이모티콘으로만 답하는 건, 너와의 대화에 에너지를 쏟고 싶지 않다는 뜻이야. 혼자 북 치고 장구 치지 마.",
        before: "이모티콘으로만 답장",
        after: "성의 없는 대화, 일방적인 노력",
        verdictMessage: "노력 낭비, 가치 없는 관계",
        triggers: ["이모지","단답"]
    },
    {
        message: "매번 네 장문 카톡에 상대가 단답으로 답하는 건, 너의 노력이 짝사랑이라는 증거야. 감정 낭비 그만하고, 자신을 아껴.",
        before: "장문 카톡에 단답 답장",
        after: "감정 소모, 자존감 하락",
        verdictMessage: "STOP! 짝사랑은 독이다",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 '바빠서'라는 핑계를 3번 이상 대면, 너는 우선순위에서 밀린 거야. 더 이상 시간 낭비하지 마.",
        before: "'바빠서' 핑계 3회 이상",
        after: "낮은 우선순위, 관계 발전 가능성 희박",
        verdictMessage: "버려! 시간 낭비다",
        triggers: ["거부"]
    },
    {
        message: "네 질문에 답 없이 자기 할 말만 하는 건, 너를 대화 상대로 존중하지 않는다는 뜻이야. 무시당하는 기분 안 들어?",
        before: "질문 무시 후 자기 할 말만 함",
        after: "무시당하는 느낌, 자존감 하락",
        verdictMessage: "존중 없는 관계, STOP!",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "네가 먼저 연락 안 하면 연락이 안 오는 건, 상대는 너에게 관심 없다는 명확한 증거야. 현실을 똑바로 봐.",
        before: "선톡 없이는 연락 없음",
        after: "상대의 무관심, 관계의 일방성",
        verdictMessage: "포기해! 답 없다",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 답장을 3일 동안 안 하는 건, 너를 완전히 잊었다는 뜻이야. 미련 버리고, 다른 사람 찾아.",
        before: "3일 동안 읽씹",
        after: "관계 단절, 미련만 남음",
        verdictMessage: "잊어! 너만 힘들어",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 '나중에 연락할게'라고 하고 연락이 없는 건, 그냥 거절하는 예의 바른 표현이야. 착각하지 마.",
        before: "'나중에 연락할게' 후 연락 없음",
        after: "거절당함, 희망고문",
        verdictMessage: "기대하지 마! 그냥 거절이야",
        triggers: ["거부"]
    },
    {
        message: "상대가 너의 이야기에 공감 없이 자기 자랑만 하는 건, 너를 그저 자기 과시의 도구로 생각한다는 뜻이야. 이용당하지 마.",
        before: "공감 없이 자기 자랑",
        after: "이용당하는 느낌, 자존감 하락",
        verdictMessage: "이용당하지 마! 너 자신을 아껴",
        triggers: ["혼자떠듦"]
    },
    {
        message: "네가 밤새 쓴 장문의 메시지에 'ㅇㅇ' 두 글자로 답장하는 건, 너의 진심을 짓밟는 행위야. 참지 마.",
        before: "장문 메시지에 'ㅇㅇ' 답장",
        after: "무시당하는 느낌, 분노",
        verdictMessage: "분노해! 참지 마",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 너의 질문을 회피하고 다른 이야기로 돌리는 건, 너에게 숨기는 것이 있다는 뜻이야. 의심해 봐.",
        before: "질문 회피 후 다른 이야기",
        after: "숨기는 사실 존재, 의심",
        verdictMessage: "수상해! 의심해 봐",
        triggers: ["질문"]
    },
    {
        message: "네가 좋아하는 티를 팍팍 내는데도 상대가 아무 반응이 없는 건, 너를 그냥 '편한 사람'으로 생각한다는 뜻이야. 벗어나.",
        before: "호감 표현에도 무반응",
        after: "편한 사람으로 취급, 짝사랑",
        verdictMessage: "벗어나! 발전 가능성 없어"
    },
    {
        message: "상대가 너에게 돈 빌려달라는 말을 3번 이상 하는 건, 너를 ATM으로 생각한다는 뜻이야. 정신 차려.",
        before: "돈 빌려달라는 말 3회 이상",
        after: "ATM 취급, 이용당함",
        verdictMessage: "정신 차려! ATM 아냐"
    },
    {
        message: "네가 데이트 계획을 짜는데 상대가 아무 의견도 내지 않는 건, 데이트할 마음이 없다는 뜻이야. 강요하지 마.",
        before: "데이트 계획에 무관심",
        after: "데이트 의지 없음, 일방적인 노력",
        verdictMessage: "강요하지 마! 혼자 즐겨"
    },
    {
        message: "상대가 너의 고민 상담에 '힘내'라는 말만 반복하는 건, 너의 감정에 공감할 능력이 없다는 뜻이야. 기대하지 마.",
        before: "고민 상담에 '힘내' 반복",
        after: "공감 능력 부족, 실망",
        verdictMessage: "기대하지 마! 위로받을 수 없어"
    },
    {
        message: "상대가 너의 칭찬에 'ㅋㅋㅋ'로만 답하는 건, 너의 칭찬을 진심으로 받아들이지 않는다는 뜻이야. 아까워.",
        before: "칭찬에 'ㅋㅋㅋ' 답장",
        after: "칭찬 무시, 섭섭함",
        verdictMessage: "아까워! 칭찬은 아무나에게 하는 게 아니야",
        triggers: ["많은ㅋ"]
    },
    {
        message: "네가 답장 속도에 맞춰주는 건 이해하지만, 상대는 그걸 당연하게 생각할 거야. 맞춰주지 마.",
        before: "답장 속도 맞춰줌",
        after: "권리인 줄 착각, 호구",
        verdictMessage: "맞춰주지 마! 너만 손해야"
    },
    {
        message: "상대가 '귀찮아'라는 말을 자주 하는 건, 너와의 관계를 유지하는 게 귀찮다는 뜻이야. 정리해.",
        before: "'귀찮아' 자주 말함",
        after: "관계 유지 귀찮음, 정리 필요",
        verdictMessage: "정리해! 너만 힘들어",
        triggers: ["거부"]
    },
    {
        message: "네가 술 마시고 연락하는 건 이해하지만, 상대는 너를 만만하게 볼 거야. 자제해.",
        before: "술 마시고 연락",
        after: "만만하게 보임, 관계 악화",
        verdictMessage: "자제해! 이미지 관리"
    },
    {
        message: "상대가 너에게 과거 연애 이야기를 자주 하는 건, 너에게 미련이 없다는 걸 은연중에 드러내는 거야. 희망 버려.",
        before: "과거 연애 이야기 자주 함",
        after: "미련 없음, 희망고문",
        verdictMessage: "희망 버려! 과거는 과거일 뿐"
    },
    {
        message: "네가 먼저 '보고 싶다'고 말했는데 상대가 아무렇지 않게 답하는 건, 너 혼자만 불타고 있다는 증거야. 진정해.",
        before: "'보고 싶다'에 무덤덤한 반응",
        after: "혼자만의 사랑, 고독함",
        verdictMessage: "진정해! 혼자 불타지 마"
    },
    {
        message: "상대가 너의 연락을 24시간 넘게 씹는 건, 너를 완벽하게 무시하는 행위야. 복수해.",
        before: "24시간 이상 읽씹",
        after: "무시당함, 분노",
        verdictMessage: "복수해! 가만히 있지 마",
        triggers: ["읽씹"]
    },
    {
        message: "네가 '미안해'라는 말을 너무 자주 하는 건, 너 자신을 깎아내리는 행위야. 당당해져.",
        before: "'미안해' 자주 말함",
        after: "자존감 하락, 관계 불균형",
        verdictMessage: "당당해져! 자신을 아껴"
    },
    {
        message: "상대가 너의 사진에 'ㅋㅋㅋ'만 남기는 건, 너의 외모를 비웃는 거야. 차단해.",
        before: "사진에 'ㅋㅋㅋ' 답장",
        after: "외모 비하, 모욕감",
        verdictMessage: "차단해! 무례한 사람",
        triggers: ["많은ㅋ"]
    },
    {
        message: "네가 '오늘 뭐 했어?'라고 물었을 때 '그냥'이라고 답하는 건, 너에게 말하고 싶지 않다는 뜻이야. 캐묻지 마.",
        before: "'오늘 뭐 했어?'에 '그냥' 답",
        after: "대화 거부, 거리감",
        verdictMessage: "캐묻지 마! 사생활 존중",
        triggers: ["질문","단답"]
    },
    {
        message: "상대가 너의 연락에 3일 간격으로 답하는 건, 너를 간만 보고 있다는 뜻이야. 놀아나지 마.",
        before: "3일 간격 답장",
        after: "간 보기, 감정 소모",
        verdictMessage: "놀아나지 마! 가치 있는 사람"
    },
    {
        message: "네가 선물을 너무 자주 주는 건, 상대에게 부담을 주는 행위야. 적당히 해.",
        before: "선물 과다",
        after: "부담감, 관계 악화",
        verdictMessage: "적당히 해! 선물은 마음만으로 충분"
    },
    {
        message: "상대가 너의 농담에 정색하는 건, 너와 유머 코드가 안 맞는다는 뜻이야. 맞춰가지 마.",
        before: "농담에 정색",
        after: "유머 코드 불일치, 불편함",
        verdictMessage: "맞춰가지 마! 솔직해져"
    },
    {
        message: "네가 상대방의 SNS를 염탐하는 건, 너 자신을 괴롭히는 행위야. 그만해.",
        before: "SNS 염탐",
        after: "자존감 하락, 불안감",
        verdictMessage: "그만해! 너 자신을 사랑해"
    },
    {
        message: "상대가 너에게 '우리 친구잖아'라는 말을 자주 하는 건, 너를 이성으로 생각하지 않는다는 뜻이야. 단념해.",
        before: "'우리 친구잖아' 자주 말함",
        after: "친구로만 생각, 단념",
        verdictMessage: "단념해! 친구는 친구일 뿐"
    },
    {
        message: "네가 상대방의 모든 게시물에 좋아요를 누르는 건, 집착으로 보일 수 있어. 자제해.",
        before: "모든 게시물 좋아요",
        after: "집착, 부담감",
        verdictMessage: "자제해! 적당한 관심이 중요"
    },
    {
        message: "상대가 너의 질문에 대답 대신 이모티콘만 보내는 건, 너와의 대화를 회피하는 거야. 의미 부여하지 마.",
        before: "질문에 이모티콘 답장",
        after: "대화 회피, 무시",
        verdictMessage: "의미 부여하지 마! 회피일 뿐",
        triggers: ["질문","이모지","단답"]
    },
    {
        message: "네가 먼저 연락해서 데이트 약속을 잡는 건 좋지만, 상대방도 노력해야 지속 가능한 관계가 돼. 확인해 봐.",
        before: "선 연락 후 데이트 약속",
        after: "관계 지속 가능성 확인 필요",
        verdictMessage: "확인해 봐! 혼자 노력하면 지쳐",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 '피곤해'라는 말을 자주 하는 건, 너와의 데이트가 즐겁지 않다는 뜻이야. 개선하거나 포기해.",
        before: "'피곤해' 자주 말함",
        after: "데이트 불만족, 관계 개선 필요",
        verdictMessage: "개선하거나 포기해! 솔직해져"
    },
    {
        message: "네가 상대방에게 맞춰 모든 취미를 바꾸는 건, 너 자신을 잃어버리는 행위야. 자신을 지켜.",
        before: "취미 전부 맞춤",
        after: "자아 상실, 불행",
        verdictMessage: "자신을 지켜! 취미는 공유하는 것"
    },
    {
        message: "상대가 너의 연락에 10분 안에 답장하면서 'ㅋㅋㅋ'를 5개 이상 쓰는 건, 너를 매우 좋아한다는 강력한 신호야. 적극적으로 다가가.",
        before: "10분 내 답장, ㅋㅋㅋ 5개 이상",
        after: "호감 확인, 적극적인 관계 발전 필요",
        verdictMessage: "GO! 놓치지 마",
        triggers: ["많은ㅋ"]
    },
    {
        message: "네가 먼저 고백했는데 상대가 3일 동안 답이 없으면, 그건 사실상 거절이야. 깔끔하게 포기하고 앞으로 나아가.",
        before: "고백 후 3일 동안 답 없음",
        after: "거절, 상처",
        verdictMessage: "포기해! 시간 낭비하지 마",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 '영화 볼래?'라는 질문에 '나중에'라고 답하는 건, 너와 영화 볼 마음이 전혀 없다는 뜻이야. 다른 사람과 봐.",
        before: "'영화 볼래?'에 '나중에' 답",
        after: "거절, 실망",
        verdictMessage: "다른 사람과 봐! 기다리지 마",
        triggers: ["질문","거부"]
    },
    {
        message: "네가 상대방에게 매일 아침 '굿모닝' 메시지를 보내는 건, 스토커처럼 보일 수 있어. 적당히 해.",
        before: "매일 아침 '굿모닝' 메시지",
        after: "스토커 취급, 부담감",
        verdictMessage: "적당히 해! 과유불급",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 '착하다'는 말만 반복하는 건, 너를 매력적인 이성으로 보지 않는다는 뜻이야. 매력을 어필해.",
        before: "'착하다'는 말만 반복",
        after: "이성적 매력 부족, 노력 필요",
        verdictMessage: "매력을 어필해! 착한 건 기본"
    },
    {
        message: "상대가 너의 메시지에 1분 안에 답장하고, 이모티콘을 3개 이상 사용하는 건, 너에게 푹 빠졌다는 증거야. 마음껏 즐겨!",
        before: "1분 내 답장, 이모티콘 3개 이상",
        after: "상대의 깊은 호감 확인, 행복",
        verdictMessage: "만끽해! 사랑받고 있어",
        triggers: ["이모지"]
    },
    {
        message: "네가 상대방에게 매일 밤 장문의 '잘 자' 메시지를 보내는 건, 집착처럼 보일 수 있어. 간결하게 해.",
        before: "매일 밤 장문 '잘 자' 메시지",
        after: "집착, 부담감",
        verdictMessage: "간결하게 해! '잘 자' 한마디면 충분",
        triggers: ["장문","연속톡"]
    },
    {
        message: "상대가 너의 질문에 3시간 뒤에 '응'이라고 단답하는 건, 너와의 대화에 전혀 관심이 없다는 뜻이야. 더 이상 노력하지 마.",
        before: "3시간 후 '응' 단답",
        after: "무관심, 노력 낭비",
        verdictMessage: "포기해! 답이 없어",
        triggers: ["질문","단답"]
    },
    {
        message: "네가 상대방의 환심을 사려고 비싼 선물을 계속 주는 건, 스스로를 싸구려로 만드는 행위야. 가치를 높여.",
        before: "지속적인 고가 선물",
        after: "자기 가치 하락, 호구 취급",
        verdictMessage: "가치를 높여! 자신을 소중히 여겨"
    },
    {
        message: "상대가 너에게 '우리 사이에는 벽이 있는 것 같아'라고 말하는 건, 사실상 이별 통보야. 질질 끌지 마.",
        before: "'우리 사이에는 벽이 있는 것 같아'",
        after: "이별 암시, 고통",
        verdictMessage: "이별 통보야! 질질 끌지 마"
    },
    {
        message: "너 지금 답장 텀 30분 넘는 거 알아? 관심 식었으면 솔직하게 말해. 질질 끌지 말고.",
        before: "늦은 답장",
        after: "상대방의 무관심",
        verdictMessage: "시간 낭비하지 마. 솔직하게 말하는 게 서로에게 좋아.",
        triggers: ["늦은 답장"]
    },
    {
        message: "또 '웅', '넹' 단답. 앵무새야? 대화하기 싫으면 그냥 말을 하지 마.",
        before: "단답형 대답",
        after: "대화 의지 부족",
        verdictMessage: "성의 없는 대화는 관계를 망쳐. 진지하게 임해.",
        triggers: ["단답"]
    },
    {
        message: "이모티콘만 5개 날리는 거 보니 할 말 없다는 거지? 감정 쓰레기통 취급하지 마.",
        before: "과도한 이모티콘 사용",
        after: "회피성 태도",
        verdictMessage: "솔직하게 감정을 표현해. 이모티콘으로 때우지 마.",
        triggers: ["이모지"]
    },
    {
        message: "장문 카톡 보내놓고 읽씹? 할 말 없으면 차라리 보내지 마. 기대하게 만들지 말고.",
        before: "장문 후 읽씹",
        after: "상대방의 혼란",
        verdictMessage: "무책임한 행동이야. 깔끔하게 정리해.",
        triggers: ["장문","읽씹"]
    },
    {
        message: "혼자 쉴 새 없이 떠드네. 나 지금 라디오 듣는 줄 알았잖아. 피드백 좀 줘.",
        before: "혼자 떠듦",
        after: "일방적인 소통",
        verdictMessage: "소통은 쌍방향이야. 상대방의 반응을 살펴.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "만나자고 했는데 '음...' 이라니. 거절할 거면 확실하게 해. 애매하게 희망고문 하지 말고.",
        before: "만남 제안에 대한 거부",
        after: "상대방의 불편함",
        verdictMessage: "솔직함이 중요해. 거절은 명확하게.",
        triggers: ["거부"]
    },
    {
        message: "ㅋㅋㅋ 10개 넘게 치는 거 보니 재미없다는 뜻이지? 영혼 없는 리액션 그만해.",
        before: "과도한 ㅋㅋㅋ 사용",
        after: "가식적인 반응",
        verdictMessage: "진솔한 감정을 보여줘. 억지 웃음은 티 나.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "매번 똑같은 질문만 하네. 나 AI 챗봇인 줄 알아? 좀 새로운 걸 물어봐.",
        before: "반복적인 질문",
        after: "상대방의 지루함",
        verdictMessage: "대화에 깊이를 더해. 흥미로운 주제를 찾아봐.",
        triggers: ["질문"]
    },
    {
        message: "연락 뜸한 거 보니 다른 사람 만나는구나? 솔직히 말하고 정리해. 양다리는 최악이야.",
        before: "연락 빈도 감소",
        after: "상대방의 불안",
        verdictMessage: "정직하게 행동해. 양다리는 상처만 남겨."
    },
    {
        message: "새벽 3시에 뜬금없이 연락하는 이유가 뭐야? 외로우면 일기장에 써.",
        before: "늦은 시간 연락",
        after: "상대방의 불편함",
        verdictMessage: "시간을 존중해. 배려 없는 행동은 불쾌감을 줘."
    },
    {
        message: "술 마시고 연락하는 거 이제 그만해. 진심이 느껴지지 않아.",
        before: "술 취한 상태 연락",
        after: "진정성 의심",
        verdictMessage: "정신 멀쩡할 때 진솔하게 대화해."
    },
    {
        message: "프로필 사진 계속 바꾸는 거 보니 심리 상태 불안정해 보이네. 나한테 풀지 마.",
        before: "잦은 프로필 사진 변경",
        after: "심리적 불안정",
        verdictMessage: "자신의 감정을 먼저 다스려."
    },
    {
        message: "계속 회피하는 태도 짜증나. 문제 해결할 생각 없으면 그냥 헤어져.",
        before: "문제 회피",
        after: "관계 악화",
        verdictMessage: "문제를 직시하고 해결하려는 노력을 보여줘.",
        triggers: ["거부"]
    },
    {
        message: "내가 너 비위 맞추는 쓰레기통인 줄 알아? 감정 기복 좀 줄여.",
        before: "감정적인 행동",
        after: "상대방의 피로감",
        verdictMessage: "감정 조절 능력을 키워."
    },
    {
        message: "카톡 답장 5시간 만에 하는 이유가 뭔데? 바쁘면 바쁘다고 말해.",
        before: "매우 늦은 답장",
        after: "무시당하는 느낌",
        verdictMessage: "상대방을 존중하는 마음을 보여줘.",
        triggers: ["늦은 답장"]
    },
    {
        message: "맨날 '미안'만 반복하지 말고, 행동으로 보여줘. 말만 번지르르한 거 지긋지긋해.",
        before: "잦은 사과",
        after: "진정성 의심",
        verdictMessage: "말보다는 행동이 중요해."
    },
    {
        message: "답장은 안 하면서 스토리 염탐하는 심리가 뭐야? 관심 있으면 솔직하게 표현해.",
        before: "스토리 염탐",
        after: "관심 표현 부족",
        verdictMessage: "숨기지 말고 솔직하게 다가가.",
        triggers: ["읽씹"]
    },
    {
        message: "너 연락할 때만 나 찾는 거 짜증나. 필요할 때만 찾지 마.",
        before: "필요할 때만 연락",
        after: "이기적인 행동",
        verdictMessage: "진심으로 상대를 대해."
    },
    {
        message: "툭하면 '됐어' 하지 마. 대화 끊고 싶으면 그냥 가.",
        before: "대화 거부",
        after: "소통 단절",
        verdictMessage: "솔직하게 감정을 표현해.",
        triggers: ["거부","단답"]
    },
    {
        message: "같은 말 계속 반복하는 거 보니 할 말 없는 거지? 억지로 대화 이어가지 마.",
        before: "반복적인 대화",
        after: "지루함",
        verdictMessage: "새로운 주제를 찾아봐."
    },
    {
        message: "내가 무슨 점쟁이야? 맥락 없이 뜬금없는 말 좀 하지 마.",
        before: "맥락 없는 대화",
        after: "소통의 어려움",
        verdictMessage: "상대방이 이해하기 쉽게 설명해."
    },
    {
        message: "밤에만 연락하는 거 보니 나를 뭘로 보는 거야? 진지하게 대해.",
        before: "늦은 밤 연락",
        after: "가벼운 관계",
        verdictMessage: "상대방을 존중하는 마음을 가져."
    },
    {
        message: "나한테 징징거리지 마. 네 문제는 네가 알아서 해결해.",
        before: "과도한 하소연",
        after: "피로감",
        verdictMessage: "자립심을 키워."
    },
    {
        message: "사진 보내달라니까 셀카만 보내는 이유가 뭐야? 소통 좀 해.",
        before: "자기 중심적인 대화",
        after: "실망감",
        verdictMessage: "상대방의 요구를 존중해."
    },
    {
        message: "오늘 있었던 일 물어보면 '그냥' 이라고 대답하는 이유가 뭐야? 벽이랑 대화하는 기분이야.",
        before: "성의 없는 대답",
        after: "답답함",
        verdictMessage: "최소한의 성의를 보여줘.",
        triggers: ["단답"]
    },
    {
        message: "계속 핑계만 대지 마. 변명 듣기 지겨워.",
        before: "잦은 핑계",
        after: "신뢰도 하락",
        verdictMessage: "솔직하게 잘못을 인정해."
    },
    {
        message: "너 지금 나랑 대화하는 거 귀찮지? 솔직하게 말해. 괜히 시간 낭비하지 말고.",
        before: "성의 없는 태도",
        after: "불편함",
        verdictMessage: "진심을 보여줘."
    },
    {
        message: "매번 똑같은 패턴으로 연락하는거 지겨워. 새로운 시도를 해봐.",
        before: "반복적인 연락 패턴",
        after: "권태감",
        verdictMessage: "관계에 변화를 줘.",
        triggers: ["연속톡"]
    },
    {
        message: "나한테 화풀이 하지 마. 감정 쓰레기통 아니야.",
        before: "화풀이",
        after: "상처",
        verdictMessage: "감정 조절을 해."
    }
];

// POSITIVE_MEDIUM: 55~74점 (200개 목표, 현재 20개)
const POSITIVE_MEDIUM = [
    {
        message: "상대방 답장이 30분 내외로 꾸준하다면, 너에게 어느 정도 호감은 있는 거야. 하지만 '오늘 뭐 했어?' 같은 질문이 없다면, 아직 너를 '특별한 사람'이라고 생각하진 않는 듯.",
        before: "30분 내외 답장",
        after: "애매한 관계",
        verdictMessage: "관계 발전 가능성 있지만, 적극적인 어필 필요",
        triggers: ["답장","질문"]
    },
    {
        message: "상대방이 너의 이야기에 'ㅋㅋㅋ'를 많이 사용하는 건 긍정적인 신호야. 하지만 내용 없이 'ㅋㅋㅋ'만 남발한다면, 대화가 지루하다는 뜻일 수도 있어. 흥미로운 화제를 던져봐.",
        before: "많은 ㅋㅋㅋ",
        after: "지루함",
        verdictMessage: "대화 주제 전환 필요",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘을 자주 사용하는 건 호감 표현일 수 있지만, 내용 없이 이모티콘만 보내는 건 대화 회피일 가능성도 있어. 진솔한 대화를 시도해 봐.",
        before: "잦은 이모티콘",
        after: "대화 회피 가능성",
        verdictMessage: "솔직한 대화 유도 필요",
        triggers: ["이모지"]
    },
    {
        message: "상대방이 장문으로 답장하는 건 너에게 집중하고 있다는 증거일 수 있어. 하지만 네 질문에 대한 구체적인 답변이 없다면, 그냥 '말 많은 사람'일 수도 있다는 걸 명심해.",
        before: "장문 답장",
        after: "피상적인 관계",
        verdictMessage: "진지한 대화 시도",
        triggers: ["장문"]
    },
    {
        message: "상대방이 너에게 먼저 질문을 하는 건 너에게 관심이 있다는 명백한 신호야. 하지만 질문의 내용이 피상적이라면, 그냥 '예의상' 묻는 걸 수도 있어. 대화의 깊이를 더해봐.",
        before: "먼저 질문",
        after: "관심 있지만 깊이는 얕음",
        verdictMessage: "깊이 있는 대화 유도",
        triggers: ["질문"]
    },
    {
        message: "상대방이 '응', '아니' 같은 단답으로만 답한다면, 너와의 대화에 별로 관심이 없다는 뜻이야. 억지로 이어가지 말고, 다른 사람을 찾아보는 게 정신 건강에 이로울 거야.",
        before: "단답형 답변",
        after: "관심 없음",
        verdictMessage: "관계 정리 고려",
        triggers: ["단답"]
    },
    {
        message: "상대방이 너의 제안을 계속 거절한다면, 너에게 호감이 없을 가능성이 매우 높아. 자존심을 지키고 다른 기회를 찾아봐.",
        before: "만남 거절",
        after: "호감 부족",
        verdictMessage: "관계 포기 고려",
        triggers: ["거부"]
    },
    {
        message: "상대방이 너의 메시지를 읽고 답장하지 않는 '읽씹'은 명백한 거절 신호야. 더 이상 매달리지 마.",
        before: "읽씹",
        after: "명백한 거절",
        verdictMessage: "관계 정리",
        triggers: ["읽씹"]
    },
    {
        message: "너 혼자 계속 카톡을 보내고 있다면, 상대방은 너와의 대화를 불편해하고 있을 가능성이 높아. 잠시 멈추고 상대방의 반응을 기다려봐.",
        before: "혼자 연속톡",
        after: "불편함",
        verdictMessage: "대화 중단 후 반응 관찰",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "상대방이 너에게 먼저 연락을 해오는 빈도가 줄었다면, 너에 대한 관심이 식어가고 있다는 뜻일 수 있어. 새로운 모습을 보여주거나, 잠시 거리를 두는 것도 방법이야.",
        before: "연락 빈도 감소",
        after: "관심 감소",
        verdictMessage: "변화 시도 또는 거리 두기"
    },
    {
        message: "상대방이 너의 질문에 엉뚱한 답변을 하거나, 화제를 돌린다면, 너와의 진지한 대화를 피하고 싶어하는 걸 수도 있어. 솔직한 감정을 털어놓고 대화해보는 건 어때?",
        before: "화제 돌리기",
        after: "진지한 대화 회피",
        verdictMessage: "솔직한 대화 시도"
    },
    {
        message: "상대방이 너의 메시지를 확인하는 데 1시간 이상 걸린다면, 너를 우선순위에 두고 있지 않다는 뜻이야. 너무 기대하지 않는 게 좋을 거야.",
        before: "늦은 답장 (1시간 이상)",
        after: "낮은 우선순위",
        verdictMessage: "기대 낮추기",
        triggers: ["답장"]
    },
    {
        message: "상대방이 너에게 먼저 안부를 묻는다면, 너를 신경 쓰고 있다는 증거야. 적극적으로 호감을 표현해봐.",
        before: "먼저 안부",
        after: "신경 씀",
        verdictMessage: "적극적인 호감 표현",
        triggers: ["질문"]
    },
    {
        message: "상대방이 너의 취미나 관심사에 대해 질문한다면, 너를 더 알아가고 싶어하는 거야. 너의 매력을 어필할 좋은 기회야.",
        before: "취미 질문",
        after: "알고 싶어 함",
        verdictMessage: "매력 어필 기회",
        triggers: ["질문"]
    },
    {
        message: "상대방이 너의 농담에 웃어준다면, 너에게 호감이 있다는 긍정적인 신호야. 하지만 과도한 농담은 역효과를 낼 수 있으니 조심해.",
        before: "농담에 웃음",
        after: "호감 신호",
        verdictMessage: "적절한 농담 유지"
    },
    {
        message: "상대방이 너의 고민을 들어주고 공감해준다면, 너를 소중하게 생각하고 있다는 증거야. 진심으로 고마움을 표현해봐.",
        before: "고민 상담",
        after: "소중하게 생각함",
        verdictMessage: "진심으로 감사 표현"
    },
    {
        message: "상대방이 너에게 데이트 신청을 한다면, 너에게 큰 호감을 가지고 있다는 뜻이야. 설레는 마음으로 데이트를 준비해봐.",
        before: "데이트 신청",
        after: "큰 호감",
        verdictMessage: "설렘을 가지고 데이트 준비"
    },
    {
        message: "상대방이 너에게 선물을 한다면, 너를 특별하게 생각하고 있다는 증거야. 정성스럽게 감사 인사를 전해봐.",
        before: "선물",
        after: "특별하게 생각함",
        verdictMessage: "정성스러운 감사 인사"
    },
    {
        message: "상대방이 너에게 칭찬을 자주 한다면, 너의 좋은 점을 발견하고 있다는 뜻이야. 자신감을 가지고 너의 매력을 발산해봐.",
        before: "잦은 칭찬",
        after: "좋은 점 발견",
        verdictMessage: "자신감 가지고 매력 발산"
    },
    {
        message: "상대방이 너에게 스킨십을 시도한다면, 너에게 매우 큰 호감을 가지고 있다는 뜻이야. 하지만 너의 마음이 준비되지 않았다면, 분명하게 거절해야 해.",
        before: "스킨십 시도",
        after: "매우 큰 호감",
        verdictMessage: "마음의 준비 상태 확인 후 결정"
    },
    {
        message: "상대방이 너에게 진심으로 사과한다면, 너를 잃고 싶지 않다는 뜻이야. 너의 마음을 솔직하게 표현하고 용서할지 결정해봐.",
        before: "진심 어린 사과",
        after: "잃고 싶지 않음",
        verdictMessage: "솔직한 감정 표현 후 용서 여부 결정"
    },
    {
        message: "상대방이 너에게 미래에 대한 이야기를 한다면, 너와의 관계를 진지하게 생각하고 있다는 증거야. 신중하게 미래를 함께 그려나갈지 고민해봐.",
        before: "미래 이야기",
        after: "진지한 관계",
        verdictMessage: "신중하게 미래를 함께 그려나갈지 고민"
    },
    {
        message: "상대방이 너에게 자신의 약점을 솔직하게 드러낸다면, 너를 믿고 의지하고 싶어한다는 뜻이야. 따뜻하게 위로하고 격려해줘.",
        before: "약점 드러내기",
        after: "믿고 의지하고 싶어함",
        verdictMessage: "따뜻한 위로와 격려"
    },
    {
        message: "상대방이 너의 연락을 기다리는 눈치라면, 너에게 완전히 빠져있다는 증거야. 하지만 너무 갑의 위치에 서지 않도록 조심해.",
        before: "연락 기다림",
        after: "완전히 빠져있음",
        verdictMessage: "갑의 위치 경계"
    },
    {
        message: "상대방이 너에게 '우리'라는 표현을 자주 사용한다면, 너를 자신의 일부라고 생각하고 있다는 뜻이야. 관계 발전을 긍정적으로 고려해봐.",
        before: "'우리'라는 표현",
        after: "자신의 일부라고 생각",
        verdictMessage: "관계 발전 긍정적 고려"
    },
    {
        message: "상대방이 너에게 과거 연애 이야기를 솔직하게 털어놓는다면, 너를 편안하게 생각하고 있다는 뜻이야. 하지만 너무 깊이 파고들지는 마.",
        before: "과거 연애 이야기",
        after: "편안하게 생각",
        verdictMessage: "적당한 거리 유지"
    },
    {
        message: "상대방이 너에게 밤늦게 연락을 한다면, 너를 편안하게 생각하고 있거나, 외로움을 느끼고 있다는 뜻이야. 상황에 따라 적절하게 대처해.",
        before: "밤늦은 연락",
        after: "편안함 또는 외로움",
        verdictMessage: "상황에 따른 적절한 대처"
    },
    {
        message: "상대방이 너에게 돈을 빌려달라고 한다면, 너를 매우 신뢰하고 있다는 뜻일 수도 있지만, 이용하려는 것일 수도 있어. 신중하게 판단해야 해.",
        before: "돈을 빌려달라는 요청",
        after: "신뢰 또는 이용",
        verdictMessage: "신중한 판단 필요"
    },
    {
        message: "상대방이 너에게 질투심을 유발하려 한다면, 너의 마음을 확인하고 싶어하는 걸 수도 있어. 하지만 지나친 질투심 유발은 관계를 망칠 수 있으니 조심해.",
        before: "질투심 유발",
        after: "마음 확인",
        verdictMessage: "지나친 질투심 유발 경계"
    },
    {
        message: "상대방이 너의 SNS 게시물에 꾸준히 좋아요를 누른다면, 너에게 관심이 있다는 뜻이야. 적극적으로 소통해봐.",
        before: "SNS 좋아요",
        after: "관심",
        verdictMessage: "적극적인 소통"
    },
    {
        message: "상대방이 너에게 '너는 특별해'와 같은 뻔한 멘트를 한다면, 너를 쉽게 생각하고 있을 수도 있어. 그의 행동을 더 자세히 관찰해봐.",
        before: "뻔한 멘트",
        after: "쉽게 생각",
        verdictMessage: "행동 관찰 필요"
    },
    {
        message: "상대방이 너에게 갑자기 연락을 끊는다면, 변심했거나 다른 이유가 있을 수 있어. 너무 자책하지 말고, 상황을 지켜봐.",
        before: "갑작스러운 연락 두절",
        after: "변심 또는 다른 이유",
        verdictMessage: "상황 지켜보기"
    },
    {
        message: "상대방이 너에게 자신의 친구들을 소개한다면, 너를 진지하게 생각하고 있다는 증거야. 좋은 인상을 남기도록 노력해봐.",
        before: "친구 소개",
        after: "진지하게 생각",
        verdictMessage: "좋은 인상 남기기"
    },
    {
        message: "상대방이 너에게 가족 이야기를 한다면, 너를 편안하게 생각하고 있다는 뜻이야. 진솔하게 대화에 참여해봐.",
        before: "가족 이야기",
        after: "편안하게 생각",
        verdictMessage: "진솔한 대화 참여"
    },
    {
        message: "상대방이 너에게 자신의 꿈이나 목표를 이야기한다면, 너를 믿고 의지하고 싶어한다는 뜻이야. 응원해주고 지지해줘.",
        before: "꿈이나 목표 이야기",
        after: "믿고 의지하고 싶어함",
        verdictMessage: "응원과 지지"
    },
    {
        message: "상대방이 너에게 함께 여행을 가자고 제안한다면, 너와 더 가까워지고 싶어하는 거야. 신중하게 결정해봐.",
        before: "여행 제안",
        after: "더 가까워지고 싶어함",
        verdictMessage: "신중한 결정"
    },
    {
        message: "상대방이 너에게 매일 아침/저녁으로 연락한다면, 너를 일상 생활의 중요한 부분으로 생각하고 있다는 뜻이야. 꾸준히 좋은 관계를 유지해봐.",
        before: "매일 아침/저녁 연락",
        after: "일상 생활의 중요한 부분",
        verdictMessage: "꾸준한 관계 유지"
    },
    {
        message: "상대방이 너에게 '너는 이상형이야'와 같은 과장된 칭찬을 한다면, 너를 쉽게 보거나, 진심이 아닐 수 있어. 주의해야 해.",
        before: "과장된 칭찬",
        after: "쉽게 보거나 진심이 아님",
        verdictMessage: "주의 필요"
    },
    {
        message: "상대방이 너에게 자신의 힘든 점을 털어놓는다면, 너를 편안하게 생각하고 있다는 뜻이야. 진심으로 위로해줘.",
        before: "힘든 점 털어놓기",
        after: "편안하게 생각",
        verdictMessage: "진심으로 위로"
    },
    {
        message: "상대방이 너에게 자신이 좋아하는 음악이나 영화를 공유한다면, 너와 취향을 공유하고 싶어하는 거야. 함께 즐겨봐.",
        before: "음악/영화 공유",
        after: "취향 공유",
        verdictMessage: "함께 즐기기"
    },
    {
        message: "상대방이 너에게 특별한 기념일을 챙겨준다면, 너를 소중하게 생각하고 있다는 증거야. 진심으로 감사 인사를 전해봐.",
        before: "기념일 챙겨주기",
        after: "소중하게 생각",
        verdictMessage: "진심으로 감사 인사"
    },
    {
        message: "상대방이 너에게 자신의 실수를 인정하고 사과한다면, 너를 존중하고 있다는 뜻이야. 너의 마음을 솔직하게 표현하고 용서할지 결정해봐.",
        before: "실수 인정 및 사과",
        after: "존중",
        verdictMessage: "솔직한 감정 표현 후 용서 여부 결정"
    },
    {
        message: "상대방이 너에게 갑자기 잠수를 탄다면, 너에게 부담을 느끼거나, 다른 이유가 있을 수 있어. 너무 매달리지 말고, 시간을 가져봐.",
        before: "갑작스러운 잠수",
        after: "부담 또는 다른 이유",
        verdictMessage: "시간 가지기"
    },
    {
        message: "상대방이 너에게 먼저 연락을 끊는 경우가 많다면, 너에게 큰 관심이 없을 수 있어. 관계를 다시 생각해봐.",
        before: "먼저 연락 끊기",
        after: "관심 부족",
        verdictMessage: "관계 재고려"
    },
    {
        message: "상대방이 너에게 자신의 가족사진을 보여준다면, 너를 편안하게 생각하고, 더 나아가 가족 구성원으로 생각하고 싶어할 수도 있어.",
        before: "가족사진 보여주기",
        after: "편안함, 가족 구성원으로 생각",
        verdictMessage: "관계 발전에 긍정적 신호"
    },
    {
        message: "상대방이 너에게 과거의 아픈 이야기를 꺼낸다면, 너를 진심으로 믿고 의지하고 싶어하는 마음이 클 거야. 따뜻하게 위로해줘.",
        before: "과거 아픈 이야기",
        after: "믿고 의지하고 싶어함",
        verdictMessage: "따뜻한 위로"
    },
    {
        message: "상대방이 너에게 애매하게 '썸' 타는 듯한 뉘앙스만 풍긴다면, 너를 '어장관리' 하고 있을 가능성도 있어. 명확한 관계를 요구해봐.",
        before: "애매한 '썸' 뉘앙스",
        after: "어장관리 가능성",
        verdictMessage: "명확한 관계 요구"
    },
    {
        message: "답장은 오는 걸 감사히 여겨. 지금은 딱 거기까지야. 더 적극적인 표현은 부담스러워할 수 있어. 속도 조절 필수!",
        before: "상대가 답장은 꼬박꼬박 하지만, 먼저 연락은 안 함",
        after: "상대는 너를 '아는 사람' 이상으로 생각하지 않을 가능성이 높음",
        verdictMessage: "관계 진전 가능성 희박. 신중하게 접근.",
        triggers: ["단답","질문"]
    },
    {
        message: "상대가 너의 이야기에 공감하는 척만 하는 건 아닌지 의심해봐. 진짜 관심 있으면 질문이 쏟아져야 정상이야.",
        before: "상대가 '아, 그렇구나' 등 피상적인 반응만 보임",
        after: "상대는 너의 이야기에 깊이 공감하지 않음",
        verdictMessage: "대화의 깊이가 얕음. 관계 발전 어려울 수 있음.",
        triggers: ["단답"]
    },
    {
        message: "네 감정을 너무 쉽게 드러내지 마. 지금은 신비주의 컨셉으로 나가야 궁금증을 유발할 수 있어.",
        before: "네가 먼저 적극적으로 감정 표현을 함",
        after: "상대는 너를 쉽게 생각할 수 있음",
        verdictMessage: "감정 조절 실패. 주도권을 뺏길 수 있음.",
        triggers: ["장문","연속톡"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'를 많이 쓰는 건 너를 편하게 생각한다는 증거. 하지만 그것만으로는 부족해. 진솔한 대화를 유도해야 해.",
        before: "상대가 'ㅋㅋㅋ'를 과도하게 사용",
        after: "상대는 너를 편한 친구 정도로 생각할 수 있음",
        verdictMessage: "관계 발전 가능성은 있지만, 노력 필요.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대의 답장 속도가 들쭉날쭉하다면, 너에게 우선순위가 아닐 가능성이 커. 너무 매달리지 마.",
        before: "상대의 답장 속도가 불규칙함",
        after: "상대는 너를 우선순위로 생각하지 않음",
        verdictMessage: "관계의 주도권을 뺏길 수 있음. 자존감을 지켜야 함.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 질문을 던지는 건, 너에 대해 더 알고 싶어한다는 신호야. 하지만 질문의 내용이 피상적이라면 경계해야 해.",
        before: "상대가 너에게 질문을 함",
        after: "상대는 너에 대한 정보를 수집하고 싶어함",
        verdictMessage: "관심은 있지만, 진심인지 판단 필요.",
        triggers: ["질문"]
    },
    {
        message: "상대가 너의 메시지를 읽고 답장하는 데 시간이 오래 걸린다면, 너와의 대화가 우선순위가 아닐 수도 있어. 너무 기대하지 마.",
        before: "상대가 너의 메시지를 읽고 답장하는 데 시간이 오래 걸림",
        after: "상대는 너와의 대화를 중요하게 생각하지 않을 수 있음",
        verdictMessage: "기대감을 낮추고, 다른 가능성을 열어두세요.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 이모티콘을 자주 사용하는 건, 너에게 호감을 표현하는 간접적인 방식일 수 있어. 하지만 이모티콘만으로는 진심을 알 수 없어.",
        before: "상대가 이모티콘을 자주 사용함",
        after: "상대는 너에게 호감을 표현하고 싶어함",
        verdictMessage: "호감은 있지만, 깊은 관계 발전은 미지수.",
        triggers: ["이모지"]
    },
    {
        message: "네가 너무 많은 이야기를 쏟아내면 상대는 질릴 수 있어. 적절한 침묵은 금과 같다는 것을 명심해.",
        before: "네가 혼자서 너무 많은 이야기를 함",
        after: "상대는 너에게 부담을 느낄 수 있음",
        verdictMessage: "대화의 균형을 맞추세요. 정보 과다 제공은 금물.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "상대가 너의 제안을 거절했다면, 실망하지 마. 거절의 이유를 파악하고, 다른 방법을 찾아보는 것이 중요해.",
        before: "상대가 너의 제안을 거절함",
        after: "상대는 너의 제안에 대한 부담감을 느꼈을 수 있음",
        verdictMessage: "거절은 끝이 아니다. 전략을 수정하세요.",
        triggers: ["거부"]
    },
    {
        message: "상대가 단답형으로만 대답한다면, 너에게 큰 관심이 없을 가능성이 높아. 대화를 억지로 이어가지 마.",
        before: "상대가 단답형으로 대답함",
        after: "상대는 너와의 대화에 흥미를 느끼지 못함",
        verdictMessage: "관계 발전 가능성 낮음. 다른 상대를 찾아보세요.",
        triggers: ["단답"]
    },
    {
        message: "상대가 답장을 늦게 하면서도, 내용이 성의 있다면 아직 기회는 있어. 하지만 늦는 이유를 묻는 건 집착으로 보일 수 있으니 참아.",
        before: "상대가 답장이 늦지만, 내용이 괜찮음",
        after: "상대는 너에게 어느 정도 관심은 있지만, 우선순위가 아닐 수 있음",
        verdictMessage: "기회는 있지만, 조심스럽게 접근해야 함.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너의 질문에만 답하고, 스스로 질문을 하지 않는다면, 대화의 주도권은 완전히 상대에게 있는 거야. 주도권을 가져와!",
        before: "상대가 너의 질문에만 답함",
        after: "상대는 너에게 정보를 얻고 싶어하지만, 정보를 주고 싶어하지 않음",
        verdictMessage: "주도권 싸움에서 밀림. 전략 수정 필요.",
        triggers: ["질문"]
    },
    {
        message: "상대가 '바빠서'라는 핑계를 자주 댄다면, 너와의 관계에 투자할 시간과 에너지가 없다는 뜻이야. 냉정하게 현실을 직시해.",
        before: "상대가 '바빠서'라는 핑계를 자주 댐",
        after: "상대는 너와의 관계에 대한 의지가 약함",
        verdictMessage: "관계 발전 가능성 희박. 시간 낭비하지 마세요.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너에게 칭찬을 하는 건 좋은 신호이지만, 칭찬의 내용이 피상적이라면 경계해야 해. 진심이 담긴 칭찬인지 확인해봐.",
        before: "상대가 너에게 칭찬을 함",
        after: "상대는 너에게 호감을 표현하고 싶어함",
        verdictMessage: "호감은 있지만, 진심인지 판단 필요."
    },
    {
        message: "네가 먼저 끊임없이 연락을 이어가면 상대는 너를 쉽게 생각할 수 있어. 가끔은 연락을 끊고 상대의 반응을 지켜봐.",
        before: "네가 먼저 끊임없이 연락을 이어감",
        after: "상대는 너를 쉽게 생각할 수 있음",
        verdictMessage: "주도권을 뺏김. 전략 수정 필요.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너의 유머에 웃어주는 건 좋은 신호이지만, 과도한 리액션은 가식일 수 있어. 진심으로 웃는 모습인지 살펴봐.",
        before: "상대가 너의 유머에 과도하게 웃음",
        after: "상대는 너에게 잘 보이고 싶어함",
        verdictMessage: "호감은 있지만, 가식인지 판단 필요.",
        triggers: ["많은ㅋ","이모지"]
    },
    {
        message: "상대가 너의 이야기에 공감해주고, 자신의 이야기도 솔직하게 털어놓는다면, 관계가 발전할 가능성이 높아. 하지만 너무 빨리 마음을 열지는 마.",
        before: "상대가 너의 이야기에 공감하고, 자신의 이야기도 솔직하게 털어놓음",
        after: "상대는 너에게 마음을 열고 싶어함",
        verdictMessage: "관계 발전 가능성 높음. 신중하게 접근하세요.",
        triggers: ["장문"]
    },
    {
        message: "상대가 너의 질문에 회피하는 대답을 한다면, 숨기는 것이 있다는 뜻이야. 더 깊이 파고들지 말고, 거리를 두는 것이 좋아.",
        before: "상대가 너의 질문에 회피하는 대답을 함",
        after: "상대는 너에게 숨기는 것이 있음",
        verdictMessage: "관계 발전 가능성 낮음. 거리를 두세요.",
        triggers: ["단답","거부"]
    },
    {
        message: "상대가 너에게 먼저 연락을 해오는 건 매우 긍정적인 신호야. 하지만 연락의 빈도와 내용을 주의 깊게 살펴봐야 해.",
        before: "상대가 너에게 먼저 연락을 해옴",
        after: "상대는 너에게 관심을 가지고 있음",
        verdictMessage: "관계 발전 가능성 높음. 신중하게 접근하세요.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너의 메시지를 읽씹하는 건 명백한 거절 신호야. 더 이상 매달리지 말고, 다른 사람을 찾아보는 것이 좋아.",
        before: "상대가 너의 메시지를 읽씹함",
        after: "상대는 너에게 관심이 없음",
        verdictMessage: "관계 발전 가능성 없음. 포기하세요.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 데이트 신청을 했다면, 성공 가능성이 매우 높아. 하지만 너무 들뜨지 말고, 신중하게 데이트를 준비해.",
        before: "상대가 너에게 데이트 신청을 함",
        after: "상대는 너에게 호감을 가지고 있음",
        verdictMessage: "성공 가능성 높음. 데이트를 통해 관계를 발전시키세요."
    },
    {
        message: "상대가 너에게 '우리'라는 표현을 사용한다면, 너를 자신의 일부로 생각하고 있다는 뜻이야. 관계가 매우 긍정적으로 흘러가고 있다는 증거야.",
        before: "상대가 너에게 '우리'라는 표현을 사용함",
        after: "상대는 너를 자신의 일부로 생각함",
        verdictMessage: "관계 매우 긍정적. 발전 가능성 높음."
    },
    {
        message: "상대가 너에게 과거 연애에 대한 이야기를 털어놓는다면, 너를 믿고 있다는 증거야. 하지만 너무 깊이 파고들지는 마.",
        before: "상대가 너에게 과거 연애에 대한 이야기를 털어놓음",
        after: "상대는 너를 믿고 있음",
        verdictMessage: "신뢰 관계 형성. 긍정적으로 발전 가능.",
        triggers: ["장문"]
    },
    {
        message: "상대가 너에게 고민 상담을 해온다면, 너를 편안하게 생각하고 있다는 증거야. 진심으로 조언해주고, 관계를 더욱 돈독하게 만들어봐.",
        before: "상대가 너에게 고민 상담을 해옴",
        after: "상대는 너를 편안하게 생각함",
        verdictMessage: "신뢰 관계 형성. 긍정적으로 발전 가능.",
        triggers: ["질문","장문"]
    },
    {
        message: "상대가 너에게 선물을 했다면, 너에게 호감을 표현하는 적극적인 행동이야. 하지만 선물의 의미를 너무 과대해석하지는 마.",
        before: "상대가 너에게 선물을 함",
        after: "상대는 너에게 호감을 표현하고 싶어함",
        verdictMessage: "호감은 있지만, 깊은 관계 발전은 미지수."
    },
    {
        message: "상대가 너에게 늦은 밤에 연락을 해온다면, 너를 이성적으로 생각하고 있을 가능성이 높아. 하지만 조심스럽게 행동해야 해.",
        before: "상대가 너에게 늦은 밤에 연락을 해옴",
        after: "상대는 너를 이성적으로 생각할 가능성이 높음",
        verdictMessage: "관계 발전 가능성 있음. 신중하게 접근하세요.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 질투심을 유발하는 행동을 한다면, 너의 마음을 떠보려는 것일 수도 있어. 냉정하게 대처하고, 휘둘리지 마.",
        before: "상대가 너에게 질투심을 유발하는 행동을 함",
        after: "상대는 너의 마음을 떠보려고 함",
        verdictMessage: "관계의 주도권을 뺏길 수 있음. 냉정하게 대처하세요."
    },
    {
        message: "상대가 너에게 자신의 이상형을 묻는다면, 너에게 관심이 있다는 신호야. 하지만 너무 솔직하게 대답하지는 마.",
        before: "상대가 너에게 자신의 이상형을 물음",
        after: "상대는 너에게 관심을 가지고 있음",
        verdictMessage: "관계 발전 가능성 있음. 신중하게 답변하세요.",
        triggers: ["질문"]
    },
    {
        message: "상대가 너에게 '너는 좋은 사람이야'라고 말한다면, 너를 이성으로 생각하지 않을 가능성이 높아. 친구로 남고 싶다는 뜻일 수도 있어.",
        before: "상대가 너에게 '너는 좋은 사람이야'라고 말함",
        after: "상대는 너를 이성으로 생각하지 않을 가능성이 높음",
        verdictMessage: "관계 발전 가능성 낮음. 친구로 남을 가능성 높음."
    },
    {
        message: "상대가 너에게 갑자기 연락을 끊는다면, 너에게 부담을 느끼거나, 다른 사람이 생겼을 가능성이 있어. 미련을 버리는 것이 좋아.",
        before: "상대가 너에게 갑자기 연락을 끊음",
        after: "상대는 너에게 부담을 느끼거나, 다른 사람이 생겼을 가능성이 있음",
        verdictMessage: "관계 발전 가능성 없음. 포기하세요.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 사소한 것까지 기억해준다면, 너에게 큰 관심을 가지고 있다는 증거야. 진심으로 감사하고, 관계를 더욱 발전시켜봐.",
        before: "상대가 너에게 사소한 것까지 기억해줌",
        after: "상대는 너에게 큰 관심을 가지고 있음",
        verdictMessage: "관계 매우 긍정적. 발전 가능성 높음."
    },
    {
        message: "상대가 너에게 자신의 약점을 솔직하게 드러낸다면, 너를 완전히 믿고 있다는 증거야. 진심으로 위로하고, 관계를 더욱 깊게 만들어봐.",
        before: "상대가 너에게 자신의 약점을 솔직하게 드러냄",
        after: "상대는 너를 완전히 믿고 있음",
        verdictMessage: "신뢰 관계 형성. 긍정적으로 발전 가능.",
        triggers: ["장문"]
    },
    {
        message: "상대가 너에게 '우리는 잘 맞는다'라고 말한다면, 너와의 관계를 긍정적으로 생각하고 있다는 증거야. 관계를 더욱 발전시켜봐.",
        before: "상대가 너에게 '우리는 잘 맞는다'라고 말함",
        after: "상대는 너와의 관계를 긍정적으로 생각함",
        verdictMessage: "관계 매우 긍정적. 발전 가능성 높음."
    },
    {
        message: "상대가 너에게 데이트 후 애프터 신청을 해온다면, 너에게 매우 만족했다는 증거야. 다음 데이트를 기대해봐.",
        before: "상대가 너에게 데이트 후 애프터 신청을 해옴",
        after: "상대는 너에게 매우 만족함",
        verdictMessage: "성공 가능성 매우 높음. 다음 데이트를 기대하세요."
    },
    {
        message: "상대가 너에게 스킨십을 시도한다면, 너를 이성적으로 매우 매력적으로 생각하고 있다는 증거야. 하지만 신중하게 판단하고, 자신의 마음을 따라야 해.",
        before: "상대가 너에게 스킨십을 시도함",
        after: "상대는 너를 이성적으로 매우 매력적으로 생각함",
        verdictMessage: "관계 발전 가능성 매우 높음. 신중하게 판단하세요."
    },
    {
        message: "상대가 너에게 '썸'이라는 단어를 사용한다면, 너와의 관계를 진지하게 생각하고 있다는 증거야. 하지만 썸만 타다가 끝날 수도 있으니, 확실하게 선을 그어야 해.",
        before: "상대가 너에게 '썸'이라는 단어를 사용함",
        after: "상대는 너와의 관계를 진지하게 생각함",
        verdictMessage: "관계 발전 가능성 높음. 확실하게 선을 그으세요."
    },
    {
        message: "상대가 너에게 고백을 했다면, 모든 것이 끝났어. 이제 너의 선택만 남았어.",
        before: "상대가 너에게 고백을 함",
        after: "상대는 너에게 진심을 표현함",
        verdictMessage: "최종 선택의 순간. 신중하게 결정하세요."
    },
    {
        message: "상대가 너에게 답장을 할 때마다 맞춤법 오류가 많다면, 너와의 대화에 집중하지 못하고 있다는 뜻이야. 진지한 관계는 어려울 수 있어.",
        before: "상대가 맞춤법 오류가 많은 답장을 보냄",
        after: "상대는 너와의 대화에 집중하지 못함",
        verdictMessage: "진지한 관계는 어려울 수 있음. 기대감을 낮추세요."
    },
    {
        message: "상대가 너에게 자신의 친구들을 소개시켜준다면, 너를 진지하게 생각하고 있다는 증거야. 결혼까지 생각할 수도 있어.",
        before: "상대가 너에게 자신의 친구들을 소개시켜줌",
        after: "상대는 너를 진지하게 생각함",
        verdictMessage: "관계 매우 긍정적. 결혼까지 생각할 수도 있음."
    },
    {
        message: "상대가 너에게 먼저 전화 통화를 걸어온다면, 너의 목소리를 듣고 싶어한다는 뜻이야. 너에게 호감이 있다는 증거야.",
        before: "상대가 너에게 먼저 전화 통화를 걸어옴",
        after: "상대는 너에게 호감을 가지고 있음",
        verdictMessage: "관계 발전 가능성 높음. 전화 통화로 관계를 발전시키세요.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 '우리는 인연인가봐'라고 말한다면, 너와의 관계를 운명적으로 생각하고 있다는 증거야. 하지만 운명론에 빠지지는 마.",
        before: "상대가 너에게 '우리는 인연인가봐'라고 말함",
        after: "상대는 너와의 관계를 운명적으로 생각함",
        verdictMessage: "관계 긍정적. 하지만 운명론에 빠지지 마세요."
    },
    {
        message: "상대가 너에게 뜬금없이 밤에 '뭐해?'라고 연락한다면, 너에게 심심함을 달래고 싶어하거나, 술김에 연락했을 가능성이 있어. 가볍게 대처하는 것이 좋아.",
        before: "상대가 밤에 '뭐해?'라고 연락함",
        after: "상대는 너에게 심심함을 달래고 싶어하거나, 술김에 연락했을 가능성이 있음",
        verdictMessage: "가벼운 관계일 가능성 높음. 신중하게 대처하세요.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 영화나 드라마 같이 보자고 한다면, 데이트를 하고 싶어하는 거야. 하지만 영화 취향이 안 맞으면 곤란할 수 있으니, 미리 확인해봐.",
        before: "상대가 너에게 영화나 드라마 같이 보자고 함",
        after: "상대는 너와 데이트를 하고 싶어함",
        verdictMessage: "관계 발전 가능성 높음. 데이트를 통해 관계를 발전시키세요."
    },
    {
        message: "상대가 너에게 '너는 이상형이랑 거리가 멀어'라고 솔직하게 말한다면, 너를 편하게 생각하거나, 아니면 어장관리를 하고 있을 가능성이 있어. 속지 마.",
        before: "상대가 너에게 '너는 이상형이랑 거리가 멀어'라고 말함",
        after: "상대는 너를 편하게 생각하거나, 어장관리를 하고 있을 가능성이 있음",
        verdictMessage: "관계 발전 가능성 낮음. 속지 마세요."
    },
    {
        message: "상대가 먼저 연락을 자주 한다면 긍정 신호. 하지만 '오늘 뭐해?' 류의 뻔한 질문만 반복한다면, 당신에게 큰 매력을 느끼는 건 아닐 수도. 대화의 깊이를 더해봐.",
        before: "상대방이 먼저 연락을 자주 함",
        after: "당신에게 호감은 있지만 깊은 관계는 망설임",
        verdictMessage: "호감은 있지만 관계 발전 가능성은 미지수",
        triggers: ["질문","연속톡"]
    },
    {
        message: "답장이 30분 내외로 꾸준히 온다면 긍정적. 하지만 30분 넘어가면 다른 일 하다가 생각나서 답장하는 걸 수도. 너무 매달리진 마.",
        before: "30분 내외의 꾸준한 답장",
        after: "적당한 관심, 하지만 우선순위는 아닐 수 있음",
        verdictMessage: "적당한 관심, 섣부른 판단은 금물"
    },
    {
        message: "상대가 당신의 이야기에 공감하는 이모지를 많이 사용한다면 좋은 징조. 하지만 이모지만 난발한다면, 대화에 집중하지 못하고 있다는 뜻일 수도 있어. 진솔한 대화를 유도해봐.",
        before: "공감 이모지 과다 사용",
        after: "표면적인 공감, 깊은 이해는 부족",
        verdictMessage: "피상적인 관계, 대화 방식 변화 필요",
        triggers: ["이모지"]
    },
    {
        message: "상대가 당신에게 'ㅋㅋㅋ'를 많이 사용한다면 호감의 표시일 수 있어. 하지만 'ㅋㅋㅋㅋㅋㅋㅋ' 이렇게 과도하게 사용한다면, 당신의 이야기가 재미없거나 어색함을 감추려는 걸 수도. 유머 코드를 바꿔보거나 진지한 대화를 시도해봐.",
        before: "'ㅋㅋㅋ' 과다 사용",
        after: "어색함 해소 또는 지루함",
        verdictMessage: "관계 개선 노력 필요",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 당신에게 장문의 메시지를 보낸다면 호감이 있다는 증거. 하지만 모든 메시지가 자기 자랑으로 가득 차 있다면, 당신에게 관심이 있는 게 아니라 자기애가 강한 사람일 가능성이 높아. 거리를 두는 것을 고려해봐.",
        before: "장문의 자기 자랑",
        after: "자기애 과잉, 관계 피로도 증가",
        verdictMessage: "관계 주의, 에너지 뱀파이어일 가능성",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "당신이 질문을 많이 하는데 상대방이 단답으로 답한다면, 당신과의 대화에 큰 흥미가 없다는 뜻. 대화 주제를 바꾸거나, 관계를 다시 생각해봐.",
        before: "질문 多, 단답형 답변",
        after: "대화 회피, 관계 소극적",
        verdictMessage: "관심 부족, 관계 재고 필요",
        triggers: ["질문","단답"]
    },
    {
        message: "상대가 당신의 제안을 거절하면서 다른 대안을 제시한다면, 당신과의 만남 자체를 싫어하는 건 아닐 가능성이 높아. 하지만 대안 없이 계속 거절한다면, 당신을 피하고 싶어하는 걸 수도 있어.",
        before: "제안 거절 + 대안 제시",
        after: "만남 자체는 긍정적, 상황적 제약",
        verdictMessage: "관계 유지 가능, 상황 지켜볼 필요",
        triggers: ["거부"]
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하지 않는 '읽씹'을 한다면, 당신에게 우선순위가 아니라는 뜻. 잦은 읽씹은 관계 단절의 신호일 수 있으니, 더 이상 매달리지 마.",
        before: "읽씹",
        after: "무관심, 관계 단절 가능성",
        verdictMessage: "관계 정리 고려",
        triggers: ["읽씹"]
    },
    {
        message: "당신 혼자 계속해서 대화를 이어가고 있다면, 상대는 대화에 참여할 의지가 없는 거야. 혼자 북 치고 장구 치는 건 그만하고, 잠시 연락을 멈춰봐.",
        before: "혼자 떠듦",
        after: "소극적 태도, 대화 참여 의지 없음",
        verdictMessage: "관계 주도권 상실, 연락 중단 고려",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 사소한 질문에도 성심성의껏 답변해준다면, 당신에게 호감이 있다는 증거. 하지만 너무 과도하게 친절하다면, 부담스러워하고 있을 수도 있어. 적당한 거리를 유지해.",
        before: "과도한 친절 + 성실한 답변",
        after: "부담감, 불편함",
        verdictMessage: "관계 속도 조절 필요",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신의 메시지에 답장하는 속도가 점점 느려진다면, 당신에 대한 관심이 식어가고 있다는 신호일 수 있어. 새로운 매력을 어필하거나, 잠시 거리를 두는 것을 고려해봐.",
        before: "답장 속도 감소",
        after: "관심도 하락",
        verdictMessage: "매력 어필 or 거리 두기"
    },
    {
        message: "상대가 당신의 질문에 대답은 하지만, 추가적인 질문을 하지 않는다면, 당신과의 대화를 이어나갈 의지가 없는 거야. 억지로 관계를 유지하려고 하지 마.",
        before: "질문에 대한 답변만, 추가 질문 없음",
        after: "대화 단절 의도",
        verdictMessage: "관계 포기 고려",
        triggers: ["질문","단답"]
    },
    {
        message: "상대가 당신에게 먼저 선톡을 자주 한다면 긍정적인 신호. 하지만 매번 같은 내용의 선톡이라면, 당신에게 습관적으로 연락하는 걸 수도 있어. 대화의 내용을 바꿔봐.",
        before: "자주 오는 선톡, 뻔한 내용",
        after: "습관적인 연락, 깊은 관계 X",
        verdictMessage: "대화 내용 변화 필요",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신이 보낸 메시지에 이모티콘으로만 답한다면, 대화하기 귀찮아하는 걸 수도 있어. 더 이상 메시지를 보내지 말고, 상대의 반응을 지켜봐.",
        before: "이모티콘으로만 답장",
        after: "대화 회피, 귀찮음",
        verdictMessage: "관계 관망, 추가 연락 자제",
        triggers: ["이모지","단답"]
    },
    {
        message: "상대가 당신의 메시지를 읽고 한참 뒤에 답장하면서, '바빠서 이제 봤어'라는 변명을 한다면, 당신을 그다지 중요하게 생각하지 않는다는 뜻. 너무 기대하지 마.",
        before: "늦은 답장 + '바빠서' 변명",
        after: "낮은 우선순위",
        verdictMessage: "기대감 낮추기",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 자신의 이야기만 한다면, 당신에게 관심이 없는 거야. 대화 주제를 바꿔보거나, 관계를 정리하는 것을 고려해봐.",
        before: "자신의 이야기만 함",
        after: "자기 중심적, 공감 능력 부족",
        verdictMessage: "관계 재고 필요",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 질문에 얼버무리거나, 회피하는 답변을 한다면, 숨기는 것이 있다는 뜻. 솔직하게 털어놓도록 유도하거나, 더 깊은 관계는 보류해.",
        before: "얼버무리는 답변, 회피",
        after: "숨기는 것 존재",
        verdictMessage: "관계 진전 보류",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신에게 칭찬을 자주 하지만, 구체적인 내용 없이 '예쁘다', '멋있다'와 같은 뻔한 칭찬만 한다면, 진심이 아닐 가능성이 높아. 겉모습에만 관심이 있는 걸 수도 있어.",
        before: "뻔한 칭찬",
        after: "외모 지향적, 피상적인 관계",
        verdictMessage: "진정성 의심, 내면 어필 노력"
    },
    {
        message: "상대가 당신에게 먼저 데이트 신청을 한다면 긍정적인 신호. 하지만 데이트 계획을 전혀 세우지 않고 당신에게만 맡긴다면, 당신을 배려하지 않는 사람일 수도 있어. 데이트 계획을 함께 세워보자고 제안해봐.",
        before: "데이트 신청, 계획은 당신에게",
        after: "배려 부족, 이기적인 성향",
        verdictMessage: "관계 주도권 확보 필요"
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 과거 연애 이야기를 꺼낸다면, 아직 과거를 잊지 못했다는 뜻. 당신을 그저 대용품으로 생각할 수도 있으니 주의해.",
        before: "과거 연애 이야기",
        after: "과거 미련, 현재 관계 소홀",
        verdictMessage: "관계 주의, 상처받을 가능성",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 유머에 억지로 웃어주는 것 같다면, 당신을 불편하게 생각하고 있을 수도 있어. 유머 코드를 바꾸거나, 진지한 대화를 시도해봐.",
        before: "억지 웃음",
        after: "불편함, 어색함",
        verdictMessage: "관계 개선 필요",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 당신에게 질문을 많이 하면서, 당신의 답변에 대해 꼬치꼬치 캐묻는다면, 당신을 의심하고 있다는 뜻. 솔직하게 해명하거나, 관계를 정리하는 것을 고려해봐.",
        before: "꼬치꼬치 캐묻는 질문",
        after: "의심, 불신",
        verdictMessage: "관계 재고 필요",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신과의 대화에서 은근히 자랑을 많이 한다면, 당신에게 잘 보이고 싶어하는 걸 수도 있어. 하지만 과도한 자랑은 허세로 보일 수 있으니 주의해.",
        before: "은근한 자랑",
        after: "자기 과시 욕구",
        verdictMessage: "허세 주의, 객관적인 판단 필요",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 메시지에 답장할 때마다 맞춤법 오류가 많다면, 당신에게 신경 쓰지 않는다는 뜻. 당신을 가볍게 생각하는 걸 수도 있어.",
        before: "맞춤법 오류 多",
        after: "무성의, 가벼운 관계",
        verdictMessage: "관계 신중하게 고려"
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하지 않으면서, 다른 사람들과는 활발하게 소통하는 모습을 보인다면, 당신을 의도적으로 무시하는 거야. 더 이상 연락하지 마.",
        before: "읽씹 + 다른 사람과 활발한 소통",
        after: "의도적 무시, 관계 단절",
        verdictMessage: "관계 정리",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 부정적인 이야기만 한다면, 당신에게 긍정적인 영향을 주지 못할 거야. 관계를 유지할지 신중하게 고민해봐.",
        before: "부정적인 이야기만 함",
        after: "관계 피로도 증가",
        verdictMessage: "관계 재고 필요",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 질문에 '글쎄', '모르겠어'와 같이 무성의한 답변만 한다면, 당신과의 대화에 참여할 의지가 없는 거야. 더 이상 질문하지 마.",
        before: "무성의한 답변",
        after: "대화 거부, 무관심",
        verdictMessage: "관계 포기 고려",
        triggers: ["질문","단답"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 용건만 간단히 말하고 대화를 끝내려고 한다면, 당신과 사적인 대화를 나누고 싶어하지 않는 거야. 관계를 발전시키기 어려울 수 있어.",
        before: "용건만 간단히",
        after: "사적인 대화 회피",
        verdictMessage: "관계 발전 어려움",
        triggers: ["단답"]
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하는 데 며칠씩 걸린다면, 당신을 완전히 잊고 살았을 가능성이 높아. 미련을 버려.",
        before: "며칠 뒤 답장",
        after: "무관심, 존재 망각",
        verdictMessage: "관계 정리",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 당신이 답장하면 바로 읽씹한다면, 당신을 가지고 노는 걸 수도 있어. 더 이상 휘둘리지 마.",
        before: "선톡 후 읽씹",
        after: "감정 조종, 관계 악용",
        verdictMessage: "관계 단절, 정신적 피해 주의",
        triggers: ["읽씹","연속톡"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 당신을 평가하거나 비판한다면, 당신의 자존감을 깎아내리는 사람이야. 즉시 관계를 끊어.",
        before: "평가, 비판",
        after: "자존감 하락, 정신적 고통",
        verdictMessage: "관계 즉시 단절",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신에게 질문을 많이 하지만, 모든 질문이 당신의 약점을 건드리는 내용이라면, 당신을 괴롭히고 싶어하는 걸 수도 있어. 즉시 차단해.",
        before: "약점 건드리는 질문",
        after: "괴롭힘, 정신적 학대",
        verdictMessage: "즉시 차단, 정신 건강 보호",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 거짓말을 한다면, 당신을 속이고 이용하려는 거야. 더 이상 믿지 마.",
        before: "거짓말",
        after: "기만, 관계 악용",
        verdictMessage: "관계 단절, 사기 피해 주의",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 메시지에 답장할 때마다 비꼬는 말투를 사용한다면, 당신을 싫어하는 거야. 더 이상 연락하지 마.",
        before: "비꼬는 말투",
        after: "적대감, 관계 혐오",
        verdictMessage: "관계 정리",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 돈을 빌려달라는 부탁만 한다면, 당신을 ATM으로 생각하는 거야. 단호하게 거절해.",
        before: "돈 빌려달라는 부탁",
        after: "금전적 착취, 관계 악용",
        verdictMessage: "단호한 거절, 금전 거래 금지",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 당신의 외모를 비하한다면, 당신의 자존감을 깎아내리는 사람이야. 즉시 관계를 끊어.",
        before: "외모 비하",
        after: "자존감 하락, 정신적 고통",
        verdictMessage: "관계 즉시 단절",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신에게 연락은 자주 하지만, 만날 약속은 절대 잡지 않는다면, 당신을 '어장관리'하고 있는 걸 수도 있어. 더 이상 시간 낭비하지 마.",
        before: "잦은 연락, 만남 회피",
        after: "어장관리, 시간 낭비",
        verdictMessage: "관계 정리",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 당신의 의견을 무시한다면, 당신을 존중하지 않는 거야. 관계를 다시 생각해봐.",
        before: "의견 무시",
        after: "무시, 존중 부족",
        verdictMessage: "관계 재고 필요",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 메시지에 답장할 때마다 '귀찮게 하지 마'라는 뉘앙스를 풍긴다면, 당신을 싫어하는 거야. 더 이상 연락하지 마.",
        before: "'귀찮게 하지 마' 뉘앙스",
        after: "거부감, 혐오",
        verdictMessage: "관계 정리",
        triggers: ["단답"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 매번 술에 취한 상태라면, 당신을 편하게 생각하는 것이 아니라 만만하게 보는 걸 수도 있어. 주의해.",
        before: "술 취한 상태로 연락",
        after: "만만하게 봄, 존중 부족",
        verdictMessage: "관계 주의, 객관적인 판단 필요",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 다른 사람의 험담만 한다면, 당신에게도 똑같이 험담할 가능성이 높아. 거리를 둬.",
        before: "다른 사람 험담",
        after: "신뢰도 하락, 관계 불안",
        verdictMessage: "거리 두기",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 질문에 답은 하지만, 항상 '나는 원래 그래'라는 식으로 변명한다면, 변화할 의지가 없는 사람이야. 기대하지 마.",
        before: "'나는 원래 그래' 변명",
        after: "변화 의지 없음, 관계 발전 X",
        verdictMessage: "기대감 낮추기",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 당신의 이야기를 전혀 들어주지 않고 자기 이야기만 한다면, 당신을 대화 상대로 생각하지 않는 거야. 관계를 끊어.",
        before: "자기 이야기만 함, 경청 X",
        after: "대화 상대로 X, 무시",
        verdictMessage: "관계 단절",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 과거의 잘못을 들춰낸다면, 당신을 용서하지 못했다는 뜻. 관계를 정리하는 것이 좋을 수도 있어.",
        before: "과거 잘못 들춰냄",
        after: "원망, 관계 악화",
        verdictMessage: "관계 정리 고려",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하지 않으면서, SNS에는 활발하게 활동하는 모습을 보인다면, 당신을 완전히 무시하는 거야. 더 이상 신경 쓰지 마.",
        before: "읽씹 + SNS 활발",
        after: "의도적 무시, 존재 무시",
        verdictMessage: "관계 정리",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신에게 먼저 연락을 해오지만, 매번 밤늦은 시간에 술 마시자는 연락만 한다면, 당신을 이성으로 생각하는 것이 아니라 하룻밤 상대로 생각하는 걸 수도 있어. 주의해.",
        before: "밤늦은 술 약속",
        after: "하룻밤 상대, 진지한 관계 X",
        verdictMessage: "관계 주의, 목적 의심",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신과의 대화에서 계속해서 당신의 단점만 지적한다면, 당신을 사랑하는 것이 아니라 괴롭히고 싶어하는 거야. 즉시 관계를 끊어.",
        before: "단점 지적",
        after: "괴롭힘, 정신적 학대",
        verdictMessage: "관계 즉시 단절",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'를 많이 쓰지만 내용이 형식적이라면, 너에게 익숙함 + 편안함이지, 호감은 아닐 수 있어. 대화의 깊이를 더해봐.",
        before: "많은ㅋ, 형식적인 대화",
        after: "편안함, 익숙함",
        verdictMessage: "호감도는 중간, 관계 진전 노력 필요",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘만 난무하는 대화는 감정 소모일 뿐. 진솔한 대화를 유도하거나, 관계를 재고해봐.",
        before: "이모지 과다 사용",
        after: "피상적인 관계",
        verdictMessage: "깊이 없는 관계, 개선 필요",
        triggers: ["이모지"]
    },
    {
        message: "네 장문에 상대가 단답이라면, 그는 네 이야기에 흥미가 없거나, 대화 자체가 불편한 걸 수도. 대화 주제를 바꿔보거나, 잠시 쉬어가는 게 좋아.",
        before: "장문, 단답",
        after: "지루함, 불편함",
        verdictMessage: "대화 방식 수정 필요",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 질문은 하지만, 네 대답에 대한 추가 질문이 없다면, 그냥 의례적인 질문일 가능성이 높아. 너무 의미 부여하지 마.",
        before: "질문, 추가 질문 없음",
        after: "의례적인 관심",
        verdictMessage: "가벼운 관계일 가능성 높음",
        triggers: ["질문"]
    },
    {
        message: "상대가 읽씹 후 늦게 답장하면서 변명을 늘어놓는다면, 핑계일 확률이 높아. 다음에도 반복되면 거리를 두는 게 좋아.",
        before: "읽씹, 늦은 답장, 변명",
        after: "불편함, 회피",
        verdictMessage: "신뢰도 하락, 관계 재고 필요",
        triggers: ["읽씹"]
    },
    {
        message: "혼자 신나서 떠들고 있다면, 상대는 지쳐있을지도 몰라. 대화의 균형을 맞춰.",
        before: "혼자떠듦",
        after: "지루함, 피로감",
        verdictMessage: "대화 방식 개선 필요",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 '바빠서', '정신없어서' 등의 핑계로 답장이 늦어진다면, 우선순위에서 밀린 걸 수도 있어. 너무 매달리지 마.",
        before: "늦은 답장, 핑계",
        after: "낮은 우선순위",
        verdictMessage: "관계 재고 필요"
    },
    {
        message: "상대가 네 질문에 '글쎄', '모르겠어' 같은 무성의한 답변만 한다면, 대화하고 싶지 않다는 간접적인 표현일 수 있어.",
        before: "질문, 무성의한 답변",
        after: "대화 거부",
        verdictMessage: "관계 발전 어려움",
        triggers: ["질문","단답"]
    },
    {
        message: "상대가 네 호의를 당연하게 받아들이고 고마워하지 않는다면, 너를 만만하게 볼 가능성이 높아. 더 이상 베풀지 마.",
        before: "호의, 당연하게 받아들임",
        after: "만만하게 여김",
        verdictMessage: "관계 재정립 필요"
    },
    {
        message: "상대가 네 연락을 기다리는 기색 없이 항상 네가 먼저 연락한다면, 그는 너에게 큰 관심이 없을 가능성이 높아.",
        before: "항상 먼저 연락",
        after: "낮은 관심",
        verdictMessage: "관계 발전 어려움",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 네 이야기를 듣는 척만 하고 딴소리를 한다면, 너에게 진심으로 관심이 없는 걸 수도 있어. 대화를 멈춰.",
        before: "듣는 척, 딴소리",
        after: "관심 없음",
        verdictMessage: "대화 중단 권고"
    },
    {
        message: "상대가 네 외모에 대한 칭찬만 한다면, 너의 다른 매력은 보지 못하고 있다는 뜻일 수도 있어. 내면을 어필해 봐.",
        before: "외모 칭찬",
        after: "피상적인 관심",
        verdictMessage: "내면 어필 필요"
    },
    {
        message: "상대가 네 부탁을 거절하면서 미안해하지 않는다면, 너를 배려하지 않는다는 뜻이야. 다시 부탁하지 마.",
        before: "거부, 미안함 없음",
        after: "배려 부족",
        verdictMessage: "관계 재고 필요",
        triggers: ["거부"]
    },
    {
        message: "상대가 네 감정적인 이야기에 공감하지 않고 냉정하게 평가한다면, 그는 너의 감정을 이해할 준비가 안 된 거야.",
        before: "감정적인 이야기, 냉정한 평가",
        after: "공감 능력 부족",
        verdictMessage: "감정 공유 자제"
    },
    {
        message: "상대가 네 질문에 답은 하지만, 자기 이야기는 전혀 하지 않는다면, 너에게 마음을 열지 않고 있는 걸 수도 있어.",
        before: "질문, 자기 이야기 없음",
        after: "마음의 거리",
        verdictMessage: "관계 발전 어려움",
        triggers: ["질문"]
    },
    {
        message: "상대가 네 연락을 가끔씩만 받고 나머지는 읽씹한다면, 너를 '보험'처럼 생각하고 있을 가능성이 있어.",
        before: "가끔 답장, 읽씹",
        after: "보험 심리",
        verdictMessage: "관계 정리 권고",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 네 칭찬에 겸손하게 반응하지 않고 당연하게 받아들인다면, 자만심이 강하거나 너를 낮잡아 볼 수 있어.",
        before: "칭찬, 당연하게 받아들임",
        after: "자만심, 무시",
        verdictMessage: "관계 재고 필요"
    },
    {
        message: "상대가 네 의견에 반박만 하고 대안을 제시하지 않는다면, 건설적인 대화를 할 의지가 없는 거야.",
        before: "반박, 대안 없음",
        after: "비협조적인 태도",
        verdictMessage: "대화 중단 권고"
    },
    {
        message: "상대가 네 약속 제안을 계속 미루기만 한다면, 너와 만날 마음이 없는 걸 수도 있어. 포기하는 게 나을 수도.",
        before: "약속 미루기",
        after: "만남 회피",
        verdictMessage: "관계 정리 권고"
    },
    {
        message: "상대가 네 메시지를 읽고 바로 답장하지 않고 시간을 끈다면, 너를 기다리게 만들려는 의도일 수 있어. 휘둘리지 마.",
        before: "늦은 답장",
        after: "간보기",
        verdictMessage: "관계 주도권 뺏기지 않도록 주의"
    },
    {
        message: "상대가 네 자랑에 시큰둥하게 반응하거나 질투하는 모습을 보인다면, 너의 성공을 진심으로 기뻐하지 않는 걸 수도 있어.",
        before: "자랑, 시큰둥한 반응/질투",
        after: "시기심",
        verdictMessage: "자랑 자제"
    },
    {
        message: "상대가 네 연락에 '응', '어' 같은 단답으로만 답한다면, 대화할 의지가 전혀 없는 거야. 더 이상 연락하지 마.",
        before: "단답",
        after: "대화 거부",
        verdictMessage: "연락 중단 권고",
        triggers: ["단답"]
    },
    {
        message: "상대가 네 과거 연애사에 대해 집요하게 묻는다면, 너를 시험하려는 의도일 수 있어. 적당히 대답해.",
        before: "과거 연애사 질문",
        after: "테스트 심리",
        verdictMessage: "방어적인 태도 필요",
        triggers: ["질문"]
    },
    {
        message: "상대가 네 실수를 지적하면서 비웃는다면, 너를 존중하지 않는다는 뜻이야. 무시해.",
        before: "실수 지적, 비웃음",
        after: "무시",
        verdictMessage: "관계 정리 권고"
    },
    {
        message: "상대가 네 고민 상담에 무관심하게 반응하거나 훈계만 한다면, 너의 어려움을 공감할 능력이 없는 거야.",
        before: "고민 상담, 무관심/훈계",
        after: "공감 능력 부족",
        verdictMessage: "상담 자제"
    },
    {
        message: "상대가 네 메시지를 읽고 답장하는 데 오래 걸리면서, 다른 사람들과는 활발하게 소통한다면, 너를 뒷전으로 생각하고 있는 거야.",
        before: "늦은 답장, 다른 사람과 활발한 소통",
        after: "낮은 우선순위",
        verdictMessage: "관계 정리 고려",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 네 선물을 받고 고마워하지 않거나, 시큰둥하게 반응한다면, 너의 마음을 가볍게 여기는 거야.",
        before: "선물, 시큰둥한 반응",
        after: "마음을 가볍게 여김",
        verdictMessage: "선물 자제"
    },
    {
        message: "상대가 네 질문에 '알아서 뭐하게?' 와 같이 공격적인 답변을 한다면, 너와의 대화를 거부하는 거야.",
        before: "질문, 공격적인 답변",
        after: "대화 거부",
        verdictMessage: "대화 중단 권고",
        triggers: ["질문"]
    },
    {
        message: "상대가 네 연락을 피하면서, SNS에는 활발하게 활동한다면, 너와의 관계를 숨기고 싶어하는 걸 수도 있어.",
        before: "연락 회피, SNS 활발",
        after: "관계 숨김",
        verdictMessage: "관계 정리 고려"
    },
    {
        message: "상대가 네 험담을 다른 사람에게 듣게 된다면, 너를 속으로 싫어하고 있는 걸 수도 있어. 거리를 둬.",
        before: "험담",
        after: "숨겨진 적대감",
        verdictMessage: "관계 정리 권고"
    },
    {
        message: "상대가 네 연락에 며칠씩 답장이 없다면, 너를 완전히 잊고 지내는 걸 수도 있어. 미련 버려.",
        before: "장기간 답장 없음",
        after: "잊혀짐",
        verdictMessage: "관계 종료",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 네 사진이나 게시물에 '좋아요'만 누르고 댓글은 전혀 달지 않는다면, 형식적인 관계일 가능성이 높아.",
        before: "좋아요, 댓글 없음",
        after: "형식적인 관계",
        verdictMessage: "관계 발전 노력 필요"
    },
    {
        message: "상대가 네 농담에 정색하면서 분위기를 싸하게 만든다면, 유머 감각이 안 맞거나 너를 불편하게 생각하는 걸 수도 있어.",
        before: "농담, 정색",
        after: "불편함",
        verdictMessage: "유머 자제"
    },
    {
        message: "상대가 네 이야기에 '그래서 어쩌라고?' 라는 식의 반응을 보인다면, 너의 감정에 전혀 공감하지 못하는 거야.",
        before: "이야기, '그래서 어쩌라고?' 반응",
        after: "공감 능력 부족",
        verdictMessage: "감정 공유 자제"
    },
    {
        message: "상대가 네 제안을 거절하면서, 다른 대안도 제시하지 않는다면, 너와 함께하고 싶지 않은 거야.",
        before: "거절, 대안 없음",
        after: "회피",
        verdictMessage: "관계 정리 고려",
        triggers: ["거부"]
    },
    {
        message: "상대가 네 연락을 무시하고 다른 사람과 놀러 간 사진을 SNS에 올린다면, 너를 대놓고 무시하는 거야. 손절해.",
        before: "연락 무시, 다른 사람과 놀러 간 사진",
        after: "무시",
        verdictMessage: "관계 종료",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 네 기분 변화에 전혀 눈치채지 못한다면, 너에게 무관심하거나 눈치가 없는 거야.",
        before: "기분 변화 무인지",
        after: "무관심, 눈치 없음",
        verdictMessage: "감정 표현 자제"
    },
    {
        message: "상대가 네 칭찬에 감사 인사는 커녕, 자기 자랑만 늘어놓는다면, 자기애가 강하거나 너를 무시하는 거야.",
        before: "칭찬, 자기 자랑",
        after: "자기애, 무시",
        verdictMessage: "칭찬 자제"
    },
    {
        message: "상대가 네 질문에 동문서답하거나 엉뚱한 답변을 한다면, 너와의 대화에 집중하지 않거나 무시하는 거야.",
        before: "질문, 동문서답",
        after: "무시",
        verdictMessage: "대화 중단 권고",
        triggers: ["질문"]
    },
    {
        message: "상대가 네 부탁을 들어주면서 생색을 낸다면, 너를 진심으로 도와주는 게 아니라, 너에게 뭔가를 바라고 있는 거야.",
        before: "부탁 들어줌, 생색",
        after: "숨겨진 의도",
        verdictMessage: "경계 필요"
    }
];

// POSITIVE_SOFT: 45~54점 (100개 목표, 현재 15개)
const POSITIVE_SOFT = [
    {
        message: "지금 네 반응, 딱 '어장관리 당하는 애' 같아. 정신 차리고 현실 직시해.",
        before: "상대방의 애매한 태도에 일희일비",
        after: "상처받고 자존감 하락",
        verdictMessage: "애매한 구간. 감정 소모 멈춰.",
        triggers: ["장문","연속톡"]
    },
    {
        message: "상대가 너한테 투자하는 시간과 노력이 너무 적어. 이건 호감이 아니라 그냥 '심심풀이'일 가능성이 커.",
        before: "상대방의 단답형 대화와 늦은 답장",
        after: "기대감과 실망감 반복",
        verdictMessage: "판단 보류. 좀 더 지켜봐.",
        triggers: ["단답","읽씹"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'만 남발하는 거 보니까 너한테 진지하게 생각 안 하는 것 같아. 감정 낭비하지 마.",
        before: "대화 내용 없이 'ㅋㅋㅋ'만 보내는 상대방",
        after: "상대방의 의도를 파악하려 애씀",
        verdictMessage: "애매한 구간. 대화의 질을 높여봐.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘으로 대화 때우려는 거, 너를 편하게 생각하는 걸 수도 있지만, 그 이상은 아닐 가능성이 높아.",
        before: "과도한 이모티콘 사용",
        after: "상대방의 진심을 궁금해함",
        verdictMessage: "판단 보류. 좀 더 적극적으로 대화해봐.",
        triggers: ["이모지"]
    },
    {
        message: "네가 먼저 계속 연락하는 거, 이제 그만해. 상대방도 노력하는 모습 보여주는지 확인해봐.",
        before: "혼자 끊임없이 대화를 주도",
        after: "지침과 불안감",
        verdictMessage: "애매한 구간. 상대방의 반응을 살펴.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "상대방 질문 빈도가 너무 적어. 너한테 진짜 관심 있는지 의심해봐.",
        before: "상대방의 소극적인 질문",
        after: "관계 발전에 대한 의문",
        verdictMessage: "판단 보류. 질문 유도해봐.",
        triggers: ["질문"]
    },
    {
        message: "상대방이 '바빠서'라는 핑계를 너무 자주 대면, 너는 우선순위가 아니라는 뜻이야.",
        before: "잦은 '바쁘다'는 핑계",
        after: "상대방의 진심에 대한 의심",
        verdictMessage: "애매한 구간. 다른 사람도 만나봐.",
        triggers: ["거부"]
    },
    {
        message: "상대방이 너의 장문에 단답으로 답하는 건, 너의 노력에 대한 무시일 수도 있어. 자존심 지켜.",
        before: "장문 메시지에 대한 단답형 답변",
        after: "허탈함과 실망감",
        verdictMessage: "애매한 구간. 대화 방식을 바꿔봐.",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 읽고 씹는 횟수가 늘어난다면, 너에 대한 관심이 식었다는 신호일 수 있어.",
        before: "잦은 읽씹",
        after: "불안과 초조",
        verdictMessage: "판단 보류. 연락 빈도 줄여봐.",
        triggers: ["읽씹"]
    },
    {
        message: "상대방이 너의 호의를 당연하게 생각하는 것 같아. 이제 그만 퍼줘.",
        before: "일방적인 호의 제공",
        after: "상대방의 무관심",
        verdictMessage: "애매한 구간. 균형을 맞춰.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너의 질문에 회피성 답변만 한다면, 뭔가 숨기는 게 있을 수도 있어.",
        before: "회피성 답변",
        after: "의심과 불신",
        verdictMessage: "판단 보류. 솔직하게 물어봐.",
        triggers: ["질문"]
    },
    {
        message: "상대가 너의 연락을 기다리는 것 같지 않아. 이제 네 시간을 소중히 해.",
        before: "상대방의 무관심한 태도",
        after: "자존감 하락",
        verdictMessage: "애매한 구간. 다른 취미를 찾아봐.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너의 이야기에 공감하는 척만 하는 것 같아. 진심으로 들어주는 사람을 찾아.",
        before: "피상적인 공감",
        after: "외로움",
        verdictMessage: "애매한 구간. 더 깊은 대화를 시도해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너를 만나는 것을 주저하는 것 같아. 더 이상 매달리지 마.",
        before: "만남 거절",
        after: "좌절감",
        verdictMessage: "애매한 구간. 다른 사람을 만나봐.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너에게 미래에 대한 이야기를 전혀 하지 않는다면, 너를 진지하게 생각하지 않는다는 증거야.",
        before: "미래에 대한 언급 없음",
        after: "불안함",
        verdictMessage: "애매한 구간. 미래에 대한 이야기를 꺼내봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 늦게 답장하면서 '미안'이라는 말도 없다면, 널 배려하지 않는 거야.",
        before: "늦은 답장과 사과 없음",
        after: "서운함",
        verdictMessage: "판단 보류. 솔직하게 말해봐.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너의 연락에 성의 없는 이모티콘만 보내는 건, 너를 귀찮아한다는 표현일 수도 있어.",
        before: "성의 없는 이모티콘 답변",
        after: "무시당하는 느낌",
        verdictMessage: "애매한 구간. 대화의 질을 높여봐.",
        triggers: ["이모지"]
    },
    {
        message: "상대가 너의 질문에 '글쎄'나 '모르겠어'라고 답하는 건, 너와의 대화를 피하고 싶어한다는 뜻이야.",
        before: "'글쎄', '모르겠어' 등의 무성의한 답변",
        after: "답답함",
        verdictMessage: "판단 보류. 다른 주제로 대화해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너에게 자신의 힘든 점만 털어놓고 너의 이야기는 듣지 않는다면, 너를 감정 쓰레기통으로 생각하는 걸 수도 있어.",
        before: "일방적인 고민 상담",
        after: "지침",
        verdictMessage: "애매한 구간. 너의 이야기도 해봐.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너에게 '착하다'는 말만 반복하는 건, 너를 이성으로 보지 않는다는 뜻일 수도 있어.",
        before: "'착하다'는 말만 반복",
        after: "실망감",
        verdictMessage: "판단 보류. 매력을 어필해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너에게 '친구'라는 단어를 자주 사용하는 건, 너와의 관계를 선 긋고 싶어한다는 뜻이야.",
        before: "'친구'라는 단어의 빈번한 사용",
        after: "좌절감",
        verdictMessage: "애매한 구간. 솔직하게 물어봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하는 데 며칠씩 걸린다면, 너를 안중에도 없다는 뜻이야.",
        before: "며칠씩 걸리는 답장",
        after: "분노",
        verdictMessage: "애매한 구간. 연락하지 마.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 '너 같은 사람'이라는 표현을 쓰는 건, 너를 낮춰보려는 심리일 수 있어.",
        before: "'너 같은 사람'이라는 표현 사용",
        after: "불쾌함",
        verdictMessage: "판단 보류. 무시해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 '응', '아니'처럼 건조하게 답하는 건, 너와의 대화에 흥미가 없다는 뜻이야.",
        before: "건조한 답변",
        after: "지루함",
        verdictMessage: "애매한 구간. 다른 주제로 대화해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 딴소리를 하는 건, 너의 질문을 회피하고 싶어한다는 뜻이야.",
        before: "딴소리",
        after: "답답함",
        verdictMessage: "판단 보류. 다시 물어봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 '~' 같은 기호를 남발하는 건, 너를 가볍게 생각한다는 표현일 수 있어.",
        before: "~ 기호 남발",
        after: "불쾌함",
        verdictMessage: "애매한 구간. 진지하게 대해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 맞춤법을 심하게 틀리는 건, 너에게 신경 쓰지 않는다는 뜻이야.",
        before: "심한 맞춤법 오류",
        after: "무시당하는 느낌",
        verdictMessage: "판단 보류. 대화 수준을 높여봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 비꼬는 말투를 사용하는 건, 너를 싫어한다는 표현일 수 있어.",
        before: "비꼬는 말투",
        after: "상처",
        verdictMessage: "애매한 구간. 관계를 끊어.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 칭찬만 하는 건, 너를 이용하려는 속셈일 수 있어.",
        before: "과도한 칭찬",
        after: "의심",
        verdictMessage: "판단 보류. 속내를 파악해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 아무 내용 없는 이모티콘만 보내는 건, 너를 무시한다는 뜻이야.",
        before: "내용 없는 이모티콘",
        after: "분노",
        verdictMessage: "애매한 구간. 연락하지 마.",
        triggers: ["이모지"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 옛날 이야기만 하는 건, 현재 너에게 관심이 없다는 뜻이야.",
        before: "옛날 이야기만 반복",
        after: "지루함",
        verdictMessage: "판단 보류. 현재 이야기를 해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 같은 말만 반복하는 건, 너와의 대화를 끝내고 싶어한다는 뜻이야.",
        before: "같은 말 반복",
        after: "답답함",
        verdictMessage: "애매한 구간. 대화를 끝내.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 질문 없이 자기 이야기만 하는 건, 너에게 관심이 없다는 뜻이야.",
        before: "자기 이야기만 함",
        after: "지침",
        verdictMessage: "판단 보류. 질문을 유도해봐.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 술 마셨다는 핑계를 대는 건, 너를 만만하게 본다는 뜻이야.",
        before: "술 핑계",
        after: "불쾌함",
        verdictMessage: "애매한 구간. 단호하게 대처해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 답장이 늦었다는 말도 없이 그냥 넘어가는 건, 너를 배려하지 않는다는 뜻이야.",
        before: "늦은 답장 후 무시",
        after: "서운함",
        verdictMessage: "판단 보류. 솔직하게 말해.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 네가 싫어하는 행동을 반복하는 건, 너를 무시한다는 뜻이야.",
        before: "싫어하는 행동 반복",
        after: "분노",
        verdictMessage: "애매한 구간. 관계를 끊어.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 너의 말을 자르는 건, 너를 존중하지 않는다는 뜻이야.",
        before: "말 자름",
        after: "불쾌함",
        verdictMessage: "판단 보류. 대화하지 마.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 너의 질문에 대답하지 않고 다른 질문을 하는 건, 너를 피한다는 뜻이야.",
        before: "질문 회피 후 엉뚱한 질문",
        after: "답답함",
        verdictMessage: "애매한 구간. 질문을 다시 해.",
        triggers: ["질문"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 네가 한 말을 기억하지 못하는 건, 너에게 관심이 없다는 뜻이야.",
        before: "네 말을 기억 못함",
        after: "무시당하는 느낌",
        verdictMessage: "판단 보류. 대화하지 마.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 너를 헷갈리게 만드는 말을 하는 건, 너를 어장관리하려는 속셈일 수 있어.",
        before: "헷갈리게 하는 말",
        after: "혼란스러움",
        verdictMessage: "애매한 구간. 관계를 정리해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 너를 무시하는 듯한 농담을 하는 건, 너를 낮춰보려는 심리일 수 있어.",
        before: "무시하는 농담",
        after: "불쾌함",
        verdictMessage: "판단 보류. 단호하게 대처해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 연락에 답장하면서 네가 불편해하는 이야기를 계속하는 건, 너를 괴롭히려는 심리일 수 있어.",
        before: "불편한 이야기 반복",
        after: "괴로움",
        verdictMessage: "애매한 구간. 관계를 끊어.",
        triggers: ["단답"]
    },
    {
        message: "상대방이 너한테 '너는 너무 착해'라는 말을 습관처럼 한다면, 널 이성으로 안 본다는 뜻일 확률이 높아. 이용당하지 않게 조심해.",
        before: "습관적인 '착하다' 칭찬",
        after: "이성적인 매력 부족에 대한 자괴감",
        verdictMessage: "애매한 구간. 매력 어필을 해보거나, 다른 사람을 찾아보는 것도 방법이야.",
        triggers: ["단답"]
    },
    {
        message: "상대방이 너의 연락에 답장은 꼬박꼬박 해주는데, 대화가 계속 이어지지 않고 끊긴다면, 널 '예의상' 챙기는 걸 수도 있어.",
        before: "답장은 꼬박꼬박 하지만, 대화가 끊김",
        after: "상대방의 진심에 대한 의문",
        verdictMessage: "판단 보류. 좀 더 적극적으로 다가가보거나, 다른 사람을 만나보는 것도 좋아.",
        triggers: ["단답"]
    },
    {
        message: "상대가 '나중에 밥 한번 먹자'는 뻔한 멘트만 날리고 구체적인 약속을 안 잡는다면, 그냥 흘러가는 말일 가능성이 높아. 기대하지 마.",
        before: "'밥 한번 먹자'는 뻔한 멘트만 반복",
        after: "기대감과 실망감 반복",
        verdictMessage: "애매한 구간. 적극적으로 약속을 잡아보거나, 잊어버리는 게 좋을 수도 있어.",
        triggers: ["단답"]
    },
    {
        message: "상대방이 너의 질문에 즉답을 피하고, '음...', '글쎄...' 같은 애매한 대답만 한다면, 뭔가 숨기는 게 있거나, 너에게 솔직해지고 싶지 않은 걸 수도 있어.",
        before: "'음...', '글쎄...' 같은 애매한 대답",
        after: "상대방의 속마음에 대한 궁금증과 불안감",
        verdictMessage: "판단 보류. 좀 더 솔직한 대화를 시도해보거나, 거리를 두는 것도 방법이야.",
        triggers: ["단답","질문"]
    },
    {
        message: "상대방이 너에게 툭하면 '너는 너무 예민해'라는 말을 한다면, 너의 감정을 무시하고, 너를 가스라이팅하려는 걸 수도 있어. 조심해.",
        before: "'너는 너무 예민해'라는 말 자주 함",
        after: "자신의 감정에 대한 의심과 자존감 하락",
        verdictMessage: "애매한 구간. 단호하게 대처하거나, 관계를 끊는 것을 고려해봐.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너한테 호감 있는지는 모르겠지만, 지금처럼 반응하면 곧 질릴 듯. ㅋㅋㅋ 남발은 매력 어필에 전혀 도움 안 됨.",
        before: "상대가 ㅋㅋㅋ 과다 사용",
        after: "상대가 가벼워 보인다고 생각",
        verdictMessage: "애매한 구간. 매력 어필 실패 가능성 높음.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "답장이 너무 느려. 상대가 너한테 맞춰주는 거 같지만, 솔직히 지쳐갈 수도 있어. 연락 빈도 좀 늘려.",
        before: "답장 속도 느림",
        after: "상대가 기다림에 지침",
        verdictMessage: "애매한 구간. 관계 지속 가능성 낮음."
    },
    {
        message: "이모티콘만 보내지 말고, 진심을 담은 대화를 해. 감정 표현 부족하면 오해만 쌓여.",
        before: "상대가 이모티콘으로만 대답",
        after: "상대가 진심을 모른다고 생각",
        verdictMessage: "애매한 구간. 소통 부족으로 관계 악화 가능성.",
        triggers: ["이모지","단답"]
    },
    {
        message: "장문으로 자기 얘기만 하지 마. 상대방도 할 말이 있을 텐데. 대화의 균형이 중요해.",
        before: "상대가 장문으로 자기 얘기만 함",
        after: "상대가 지루함과 피로감을 느낌",
        verdictMessage: "애매한 구간. 일방적인 대화는 관계에 독.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "질문만 하지 말고, 너도 너에 대한 정보를 좀 줘. 궁금증만 유발하고 속을 안 보여주면 답답해.",
        before: "상대가 질문만 함",
        after: "상대가 속을 알 수 없다고 생각",
        verdictMessage: "애매한 구간. 방어적인 태도는 거리감을 만들 수 있음.",
        triggers: ["질문"]
    },
    {
        message: "단답은 대화 끊겠다는 신호로 보일 수 있어. 최소한 성의 있는 답변을 해줘.",
        before: "상대가 단답으로 대답",
        after: "상대가 대화 의지가 없다고 생각",
        verdictMessage: "애매한 구간. 관계 단절 가능성.",
        triggers: ["단답"]
    },
    {
        message: "너무 쉽게 거절하지 마. 상대방이 상처받을 수도 있어. 좀 더 신중하게 생각해보고 말해.",
        before: "상대가 거절",
        after: "상대가 상처받음",
        verdictMessage: "애매한 구간. 관계 악화 가능성 높음.",
        triggers: ["거부"]
    },
    {
        message: "읽씹은 최악이야. 바쁘더라도 최소한 답장은 해줘. 무시는 절대 안 돼.",
        before: "상대가 읽씹",
        after: "상대가 무시당했다고 생각",
        verdictMessage: "애매한 구간. 관계 파탄 직전.",
        triggers: ["읽씹"]
    },
    {
        message: "혼자 계속 톡 보내지 마. 상대방 부담스러워. 답장 올 때까지 기다려.",
        before: "상대가 연속톡",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 집착으로 보일 수 있음.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "상대방 반응 살피면서 대화해. 너 혼자 신나서 떠들면 누가 좋아하겠어?",
        before: "상대가 혼자 떠듦",
        after: "상대가 지루해함",
        verdictMessage: "애매한 구간. 공감 능력 부족으로 관계 악화.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "너무 들이대지 마. 상대방 부담스러워할 수 있어. 적당한 거리를 유지해.",
        before: "상대가 과도하게 들이댐",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 관계 진전 어려움."
    },
    {
        message: "칭찬은 좋지만, 너무 과하면 아첨으로 들려. 진심을 담아서 칭찬해.",
        before: "상대가 과도한 칭찬",
        after: "상대가 아첨으로 생각",
        verdictMessage: "애매한 구간. 진정성 의심받을 수 있음."
    },
    {
        message: "과거 연애 얘기는 자제해. 지금 만나는 사람에게 집중해야지.",
        before: "상대가 과거 연애 얘기",
        after: "상대가 불안해함",
        verdictMessage: "애매한 구간. 현재 관계에 집중해야 함."
    },
    {
        message: "상대방의 관심사를 파악하고 대화에 활용해. 공통 관심사를 찾는 게 중요해.",
        before: "대화 주제가 일방적",
        after: "상대가 지루해함",
        verdictMessage: "애매한 구간. 공통 관심사 부족."
    },
    {
        message: "약속 시간을 너무 쉽게 변경하지 마. 상대방은 널 신뢰하지 않게 될 거야.",
        before: "상대가 약속 변경",
        after: "상대가 불신함",
        verdictMessage: "애매한 구간. 신뢰도 하락."
    },
    {
        message: "상대방의 말을 경청하고 있다는 신호를 줘. 맞장구라도 좀 쳐줘.",
        before: "상대가 경청 부족",
        after: "상대가 소외감 느낌",
        verdictMessage: "애매한 구간. 공감 능력 부족."
    },
    {
        message: "유머는 좋지만, 상황에 맞게 사용해야지. 뜬금없는 유머는 분위기만 망쳐.",
        before: "상대가 부적절한 유머",
        after: "상대가 불쾌해함",
        verdictMessage: "애매한 구간. 분위기 파악 능력 부족."
    },
    {
        message: "너무 계산적으로 행동하지 마. 진심을 보여줘.",
        before: "상대가 계산적인 행동",
        after: "상대가 진심을 의심함",
        verdictMessage: "애매한 구간. 진정성 부족."
    },
    {
        message: "상대방의 감정을 무시하지 마. 공감해주는 게 중요해.",
        before: "상대가 감정 무시",
        after: "상대가 상처받음",
        verdictMessage: "애매한 구간. 공감 능력 부족."
    },
    {
        message: "답장이 늦어지는 이유를 설명해주는 게 예의야. 그냥 뭉뚱그려 넘기지 마.",
        before: "상대가 늦은 답장에 대한 설명 부족",
        after: "상대가 무시당한다고 생각",
        verdictMessage: "애매한 구간. 배려 부족."
    },
    {
        message: "싸우고 나서 바로 화해하지 마. 감정을 정리할 시간을 가져.",
        before: "상대가 즉시 화해 시도",
        after: "감정 해소 부족",
        verdictMessage: "애매한 구간. 감정 소모 심화."
    },
    {
        message: "SNS에 너무 많은 정보를 올리지 마. 프라이버시는 지켜야지.",
        before: "상대가 과도한 SNS 정보 공개",
        after: "상대가 불안해함",
        verdictMessage: "애매한 구간. 정보 과다 노출."
    },
    {
        message: "상대방의 친구나 가족을 험담하지 마. 관계만 악화될 뿐이야.",
        before: "상대가 험담",
        after: "상대가 불쾌해함",
        verdictMessage: "애매한 구간. 관계 파탄 가능성."
    },
    {
        message: "데이트 비용을 항상 네가 내려고 하지 마. 상대방도 부담스러워.",
        before: "상대가 데이트 비용 독점",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 불균형적인 관계."
    },
    {
        message: "상대방의 의견을 존중하고, 비난하지 마. 건설적인 대화가 필요해.",
        before: "상대가 비난",
        after: "상대가 상처받음",
        verdictMessage: "애매한 구간. 관계 악화."
    },
    {
        message: "너무 완벽한 모습만 보여주려고 하지 마. 솔직한 모습을 보여주는 게 더 매력적이야.",
        before: "상대가 완벽한 모습만 보이려고 함",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 진솔함 부족."
    },
    {
        message: "상대방의 취미를 존중하고, 함께 즐기려고 노력해봐. 공통 분모를 만드는 게 중요해.",
        before: "취미 공유 부족",
        after: "상대가 소외감 느낌",
        verdictMessage: "애매한 구간. 공통 관심사 부족."
    },
    {
        message: "상대방의 작은 변화에도 관심을 가져줘. 칭찬은 관계를 더욱 돈독하게 만들어.",
        before: "상대가 무관심",
        after: "상대가 서운해함",
        verdictMessage: "애매한 구간. 관심 부족."
    },
    {
        message: "매일 똑같은 데이트 코스는 지루해. 새로운 시도를 해봐.",
        before: "반복적인 데이트 코스",
        after: "상대가 지루해함",
        verdictMessage: "애매한 구간. 관계의 활력 저하."
    },
    {
        message: "상대방의 과거를 캐묻지 마. 현재에 집중하는 게 중요해.",
        before: "과거 캐묻기",
        after: "상대가 불쾌해함",
        verdictMessage: "애매한 구간. 불필요한 갈등 유발."
    },
    {
        message: "너만 연락 기다리지 말고, 먼저 연락해봐. 적극적인 모습이 중요해.",
        before: "소극적인 태도",
        after: "상대가 지쳐감",
        verdictMessage: "애매한 구간. 관계 진전 어려움."
    },
    {
        message: "상대방의 스케줄을 고려하지 않고 약속 잡지 마. 배려심이 부족해 보여.",
        before: "일방적인 약속",
        after: "상대가 불편해함",
        verdictMessage: "애매한 구간. 배려 부족."
    },
    {
        message: "너무 자주 연락하는 건 오히려 독이 될 수 있어. 적당한 거리를 유지해.",
        before: "과도한 연락",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 집착으로 보일 수 있음.",
        triggers: ["연속톡"]
    },
    {
        message: "상대방의 고민을 들어주고, 진심으로 공감해줘. 감정적인 지지가 중요해.",
        before: "공감 부족",
        after: "상대가 외로움 느낌",
        verdictMessage: "애매한 구간. 정서적 교감 부족."
    },
    {
        message: "말로만 사랑한다고 하지 말고, 행동으로 보여줘. 진심은 행동으로 증명되는 거야.",
        before: "말뿐인 사랑",
        after: "상대가 진심을 의심함",
        verdictMessage: "애매한 구간. 신뢰도 하락."
    },
    {
        message: "상대방의 단점을 지적하기보다는 장점을 칭찬해줘. 긍정적인 관계가 중요해.",
        before: "단점 지적",
        after: "상대가 상처받음",
        verdictMessage: "애매한 구간. 관계 악화 가능성."
    },
    {
        message: "너무 많은 사람들과 비교하지 마. 너만의 매력을 어필해.",
        before: "비교하는 태도",
        after: "상대가 자존감 하락",
        verdictMessage: "애매한 구간. 관계 불안정."
    },
    {
        message: "상대방에게 모든 것을 의지하지 마. 독립적인 모습을 보여줘.",
        before: "과도한 의존",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 관계 불균형."
    },
    {
        message: "솔직하게 자신의 감정을 표현하되, 상대방을 배려하는 마음을 잊지 마.",
        before: "감정 표현 부족 또는 과잉",
        after: "상대가 오해함",
        verdictMessage: "애매한 구간. 감정 조절 필요."
    },
    {
        message: "상대방의 실수를 용서하고, 이해하려고 노력해. 관용은 관계를 유지하는 데 필수적이야.",
        before: "용서 부족",
        after: "상대가 죄책감 느낌",
        verdictMessage: "애매한 구간. 관계 악화 가능성."
    },
    {
        message: "너의 꿈과 목표를 공유하고, 상대방의 꿈을 응원해줘. 함께 성장하는 관계가 이상적이야.",
        before: "꿈 공유 부족",
        after: "상대가 소외감 느낌",
        verdictMessage: "애매한 구간. 미래 공유 부족."
    },
    {
        message: "상대방의 가족에게 잘 대해줘. 가족과의 관계는 매우 중요해.",
        before: "가족 관계 소홀",
        after: "상대가 불안해함",
        verdictMessage: "애매한 구간. 관계 발전 제한."
    },
    {
        message: "너무 잦은 다툼은 관계를 망칠 수 있어. 서로의 의견을 존중하고 타협하는 자세가 필요해.",
        before: "잦은 다툼",
        after: "상대가 지쳐감",
        verdictMessage: "애매한 구간. 관계 파탄 직전."
    },
    {
        message: "상대방에게 거짓말하지 마. 신뢰는 한 번 깨지면 회복하기 어려워.",
        before: "거짓말",
        after: "상대가 불신함",
        verdictMessage: "애매한 구간. 관계 파탄 가능성 높음."
    },
    {
        message: "너의 친구들에게 상대방을 소개하고, 함께 어울리는 시간을 가져봐. 사회적 관계도 중요해.",
        before: "사회적 관계 단절",
        after: "상대가 소외감 느낌",
        verdictMessage: "애매한 구간. 관계 발전 제한."
    },
    {
        message: "상대방에게 선물을 너무 자주 주지 마. 물질적인 것보다는 마음이 중요해.",
        before: "과도한 선물 공세",
        after: "상대가 부담스러워함",
        verdictMessage: "애매한 구간. 진정성 의심받을 수 있음."
    },
    {
        message: "상대방에게 존댓말만 쓰지 말고, 가끔 편하게 대해봐. 친밀감을 높이는 데 도움이 될 거야.",
        before: "지속적인 존댓말 사용",
        after: "상대가 거리감 느낌",
        verdictMessage: "애매한 구간. 관계 진전 어려움."
    },
    {
        message: "상대방 답장이 3시간 씩 늦어지는 거, 너한테 우선순위가 밀렸다는 뜻이야. 정신차려.",
        before: "답장 속도 느려짐",
        after: "상대방의 우선순위 변화",
        verdictMessage: "가능성 희박, 시간 낭비하지 마.",
        triggers: ["단답","읽씹"]
    },
    {
        message: "네 감정 쓰레기통 역할 해주는 거 이제 그만해. 걔 힘든 얘기 들어주는 게 연애가 아니잖아.",
        before: "상대방의 감정적인 하소연",
        after: "자존감 하락 및 감정 소모",
        verdictMessage: "착취당하는 중, 관계 재고 필요.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "상대가 '바빠서 연락 잘 못해'라는 말, 솔직히 너한테만 그러는 걸 수도 있어. 다른 사람 만날 시간은 있겠지.",
        before: "상대방의 바쁘다는 핑계",
        after: "소외감 및 의심",
        verdictMessage: "회피성 발언, 진실을 마주봐.",
        triggers: ["단답","거부"]
    },
    {
        message: "단답형 대답만 돌아오는 거 안 힘들어? 앵무새랑 대화하는 기분이겠다. 자존심 좀 챙겨.",
        before: "단답형 대화",
        after: "자존감 하락",
        verdictMessage: "일방적인 관계, 개선 혹은 포기.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너한테 궁금한 게 하나도 없는 것 같네. 혼자 벽 보고 얘기하는 거랑 뭐가 달라?",
        before: "상대방의 질문 없음",
        after: "소외감 및 무관심",
        verdictMessage: "관심 부족, 대화 단절 위험.",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "카톡에 ㅋㅋㅋ만 넘쳐나는 거, 너를 진지하게 생각 안 한다는 증거일 수도 있어. 가벼운 관계로 보는 거지.",
        before: "과도한 'ㅋㅋㅋ' 사용",
        after: "관계의 가벼움",
        verdictMessage: "진지함 결여, 깊은 관계는 어려움.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 맨날 '나중에' 보자고 하는 거, 그냥 너랑 안 보고 싶다는 돌려 말하기일 수 있어. 낚이지 마.",
        before: "'나중에'라는 회피성 약속",
        after: "기대감과 실망",
        verdictMessage: "미래 없는 약속, 시간 낭비.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너의 장문 카톡을 읽씹하는 건, 너의 감정을 무시하는 거나 마찬가지야. 더 이상 상처받지 마.",
        before: "장문 메시지 읽씹",
        after: "무시당하는 느낌 및 자존감 하락",
        verdictMessage: "소통 부재, 관계 악화.",
        triggers: ["장문","읽씹"]
    },
    {
        message: "이모티콘만 보내는 거, 대화하기 귀찮다는 뜻이야. 너한테 할 말이 없는 거지.",
        before: "잦은 이모티콘 사용",
        after: "대화 회피",
        verdictMessage: "피상적인 관계, 깊이 있는 대화 부족.",
        triggers: ["이모지","단답"]
    },
    {
        message: "네 카톡에만 답장이 느린 거면, 답은 정해져 있는 거 아니겠어? 다른 사람한테는 빠르겠지.",
        before: "선택적인 답장 속도",
        after: "비교 및 질투",
        verdictMessage: "차별적 대우, 관계 불균형.",
        triggers: ["읽씹"]
    },
    {
        message: "혼자 계속 말하고 있는 거 알아? 상대는 그냥 듣고만 있잖아. 대화가 아니라 강연인데.",
        before: "일방적인 대화 주도",
        after: "상대방의 침묵",
        verdictMessage: "소통 단절, 균형 있는 대화 필요.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너의 질문에 대답을 회피하는 건, 숨기는 게 있다는 뜻일 수도 있어. 떳떳하면 다 말하겠지.",
        before: "질문 회피",
        after: "의심 및 불안",
        verdictMessage: "불투명한 관계, 신뢰 부족.",
        triggers: ["질문","거부"]
    },
    {
        message: "상대가 너의 연락을 당연하게 생각하는 것 같아. 가끔은 연락을 끊어봐. 소중함을 알게 될 수도.",
        before: "당연하게 생각하는 연락",
        after: "권태감 및 소홀함",
        verdictMessage: "관계의 재정비 필요, 긴장감 유지.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너의 호의를 권리인 줄 아는 것 같아. 베풀수록 더 요구할 거야. 적당히 해.",
        before: "호의를 당연하게 받아들임",
        after: "착취 및 불만 증가",
        verdictMessage: "관계의 불균형, 합리적인 선 긋기 필요."
    },
    {
        message: "상대가 너의 모든 카톡에 '응', '넹'으로 답하는 거, 너랑 대화하기 싫다는 무언의 시위일지도 몰라.",
        before: "'응', '넹'으로 답하는 경우",
        after: "무관심 및 소통 거부",
        verdictMessage: "성의 없는 대화, 관계 개선 어려움.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 카톡 내용을 기억 못 하는 건, 너에게 관심이 없다는 뜻이야. 흘려듣는 거지.",
        before: "대화 내용 기억 못 함",
        after: "무관심 및 소홀함",
        verdictMessage: "기억력 문제 X, 관심 부족 O."
    },
    {
        message: "상대가 너에게 미안하다는 말만 반복하는 건, 변할 의지가 없다는 뜻이야. 말만 번지르르한 거지.",
        before: "미안하다는 말만 반복",
        after: "변화에 대한 의지 부족",
        verdictMessage: "반복되는 문제, 개선 의지 없음."
    },
    {
        message: "상대가 너의 카톡을 읽고 몇 시간 뒤에 답장하는 건, 너보다 중요한 일이 많다는 뜻이야. 서운해하지 마.",
        before: "늦은 답장",
        after: "낮은 우선순위",
        verdictMessage: "기대 낮추기, 상처받지 않도록.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 '피곤하다'는 말을 자주 하는 건, 너와의 대화가 지친다는 뜻일 수도 있어. 부담스럽게 하지 마.",
        before: "잦은 피곤함 호소",
        after: "대화 기피",
        verdictMessage: "관계의 권태기, 휴식이 필요."
    },
    {
        message: "상대가 너의 연락을 피하는 것 같으면, 그냥 놔줘. 붙잡는다고 달라질 건 없어.",
        before: "연락 회피",
        after: "관계 단절 가능성",
        verdictMessage: "억지로 유지 X, 자연스러운 흐름에 맡기기.",
        triggers: ["읽씹","단답"]
    },
    {
        message: "상대가 너에게 '착하다'는 말만 하는 건, 너를 이성으로 보지 않는다는 뜻일 수도 있어. 친구 이상은 아닌 거지.",
        before: "'착하다'는 칭찬",
        after: "이성적인 매력 부족",
        verdictMessage: "친구 존, 더 이상의 발전은 어려움."
    },
    {
        message: "상대가 너의 고민을 가볍게 넘기는 건, 너를 진지하게 생각하지 않는다는 뜻이야. 속마음은 털어놓지 마.",
        before: "고민을 가볍게 넘김",
        after: "신뢰 부족",
        verdictMessage: "진지한 대화 불가, 깊은 관계 어려움."
    },
    {
        message: "상대가 너의 질문에 '글쎄'라고 답하는 건, 대답하기 싫다는 뜻이야. 더 캐묻지 마.",
        before: "'글쎄'라는 답변",
        after: "대화 거부 의사",
        verdictMessage: "회피성 답변, 더 이상의 질문은 무의미.",
        triggers: ["질문","단답","거부"]
    },
    {
        message: "상대가 너의 데이트 신청을 계속 미루는 건, 너랑 데이트하고 싶지 않다는 뜻이야. 눈치껏 포기해.",
        before: "데이트 신청 거절",
        after: "데이트 의사 없음",
        verdictMessage: "거절 의사 분명, 더 이상 기대 X.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너에게 '바쁘다'는 말을 습관처럼 하는 건, 너와의 관계에 시간을 투자하고 싶지 않다는 뜻이야.",
        before: "습관적인 '바쁘다'는 말",
        after: "관계에 대한 투자 부족",
        verdictMessage: "시간 부족 X, 우선순위 낮음 O."
    },
    {
        message: "상대가 너의 카톡에 답장할 때마다 'ㅋㅋㅋ'를 5개 이상씩 붙이는 건, 너를 편하게 생각하거나, 아니면 진지하게 생각하지 않거나 둘 중 하나야.",
        before: "과도한 ㅋㅋㅋ 사용",
        after: "관계의 가벼움 혹은 편안함",
        verdictMessage: "진지함 부족, 관계 발전 가능성 낮음.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 너에게 '오빠/누나 동생'으로만 대하는 건, 너를 이성으로 생각하지 않는다는 명확한 신호야. 괜히 기대하지 마.",
        before: "'오빠/누나 동생' 호칭 사용",
        after: "이성적인 감정 없음",
        verdictMessage: "가족 존, 관계 발전 가능성 희박."
    },
    {
        message: "상대가 너의 칭찬에 무덤덤하게 반응하는 건, 너의 호감을 부담스러워하거나, 아니면 이미 알고 있어서 당연하게 생각하거나 둘 중 하나야.",
        before: "칭찬에 대한 무덤덤한 반응",
        after: "부담감 혹은 당연함",
        verdictMessage: "호감 표현 효과 미미, 다른 전략 필요."
    },
    {
        message: "상대가 너의 질문에 엉뚱한 대답을 하는 건, 너의 질문을 회피하고 싶거나, 아니면 너와 진지하게 대화하고 싶지 않다는 뜻이야.",
        before: "엉뚱한 대답",
        after: "대화 회피 의도",
        verdictMessage: "소통 불가, 관계 발전 어려움.",
        triggers: ["질문","거부"]
    },
    {
        message: "상대가 너에게 '귀찮다'는 표현을 사용하는 건, 너와의 관계를 불편하게 생각한다는 명백한 신호야. 더 이상 다가가지 마.",
        before: "'귀찮다'는 표현 사용",
        after: "관계 불편함",
        verdictMessage: "관계 악화, 거리 두기 필요."
    },
    {
        message: "상대가 너의 연락에 띄엄띄엄 답장하면서, 동시에 다른 사람들과는 활발하게 소통하는 걸 보면, 답은 나온 거 아니겠어?",
        before: "선택적인 답장 빈도",
        after: "비교 대상 존재",
        verdictMessage: "우선순위 낮음, 다른 사람에게 기회.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 사적인 질문을 전혀 하지 않는 건, 너에게 관심이 없거나, 너와의 관계를 깊게 발전시키고 싶지 않다는 뜻이야.",
        before: "사적인 질문 없음",
        after: "관심 부족",
        verdictMessage: "피상적인 관계, 발전 가능성 낮음.",
        triggers: ["질문"]
    },
    {
        message: "상대가 너의 유머에 전혀 웃지 않는 건, 너의 유머 감각이 안 맞는 걸 수도 있지만, 너에게 호감이 없어서일 수도 있어.",
        before: "유머에 대한 무반응",
        after: "호감 부족",
        verdictMessage: "유머 코드 불일치 혹은 호감 부족."
    },
    {
        message: "상대가 너에게 칭찬을 할 때마다 '근데'를 붙이는 건, 너의 장점 뒤에 숨겨진 단점을 지적하고 싶어하는 심리일 수 있어.",
        before: "'칭찬 + 근데'",
        after: "숨겨진 비판 의도",
        verdictMessage: "겉으로는 칭찬, 속으로는 비판."
    },
    {
        message: "상대가 너에게 '너는 좋은 사람이야'라고 말하는 건, 너를 이성으로 보지 않고, 그냥 좋은 친구로 생각한다는 뜻일 가능성이 높아.",
        before: "'너는 좋은 사람이야'라는 말",
        after: "이성적인 매력 부족",
        verdictMessage: "친구 존 확정, 관계 발전 어려움."
    },
    {
        message: "상대가 너에게 '다음에 밥 한번 먹자'라고 말하고, 구체적인 약속을 잡지 않는 건, 그냥 하는 말일 뿐이야. 기대하지 마.",
        before: "'다음에 밥 한번 먹자' + 약속 X",
        after: "약속 의지 없음",
        verdictMessage: "빈말, 기대 X.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너의 카톡을 읽고 답장하는 데 하루 이상 걸리는 건, 너를 우선순위에 두지 않고 있다는 명확한 증거야. 잊어.",
        before: "24시간 이상 답장 지연",
        after: "낮은 우선순위",
        verdictMessage: "무관심, 포기.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 '나는 연애에 관심 없어'라고 말하는 건, 너에게 관심이 없다는 완곡한 표현이야. 알아들어.",
        before: "'연애에 관심 없어' 발언",
        after: "관계 거부 의사",
        verdictMessage: "거절, 더 이상 노력 X.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너의 데이트 신청을 거절하면서, 다른 사람들과는 놀러 다니는 사진을 SNS에 올리는 건, 너를 싫어한다는 뜻과 같아.",
        before: "데이트 거절 + 타인과 SNS 활동",
        after: "명백한 거부 의사",
        verdictMessage: "거절, 감정 낭비 X.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너에게 '우리는 친구잖아'라고 말하는 건, 너와의 관계를 선 긋고 싶어하는 거야. 더 이상 넘보지 마.",
        before: "'우리는 친구잖아' 발언",
        after: "관계 선 긋기",
        verdictMessage: "친구 존, 관계 발전 불가."
    }
];

// NEGATIVE_SOFT: 30~44점 (100개 목표, 현재 15개)
const NEGATIVE_SOFT = [
    {
        message: "계속 'ㅋㅋㅋ'만 치는 거 보니까, 너도 딱히 할 말 없는 거지? 억지로 맞장구치는 거 티나.",
        before: "상대방의 과도한 ㅋㅋㅋ 사용",
        after: "억지로 대화에 참여하는 심리",
        verdictMessage: "억지 공감은 관계에 도움 안 됨. 솔직해져.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘 도배하는 거, 귀여운 척 하는 거야? 아니면 할 말이 없는 거야? 둘 다 별로.",
        before: "과도한 이모티콘 사용",
        after: "할 말이 없거나 귀여운 척하려는 심리",
        verdictMessage: "진심을 담아 말해. 이모티콘은 포장이잖아.",
        triggers: ["이모지"]
    },
    {
        message: "장문 카톡에 질렸어. 핵심만 간결하게 말해줘. 나 지금 네 소설 읽어줄 기분 아니거든.",
        before: "상대방의 지나치게 긴 메시지",
        after: "상대방의 지루함과 짜증 유발",
        verdictMessage: "간결함이 매력이야. 장황함은 지루함을 낳을 뿐.",
        triggers: ["장문"]
    },
    {
        message: "질문만 던지지 말고, 너도 좀 대화에 참여해. 심문 받는 기분이야.",
        before: "지속적인 질문만 하는 상대방",
        after: "심문 받는 듯한 압박감",
        verdictMessage: "핑퐁 대화가 중요해. 질문만 하지 마.",
        triggers: ["질문"]
    },
    {
        message: "단답형 대답, 짜증나. 대화하기 싫으면 솔직하게 말해.",
        before: "단답형 대답",
        after: "대화 거부 의사 표현으로 인식",
        verdictMessage: "성의 없는 대화는 관계를 망쳐.",
        triggers: ["단답"]
    },
    {
        message: "돌려 말하지 말고, 싫으면 싫다고 딱 말해. 빙빙 돌려 말하는 거 짜증나.",
        before: "애매한 거절 표현",
        after: "답답함과 짜증 유발",
        verdictMessage: "솔직함이 최고의 미덕이야. 애매함은 오해를 낳아.",
        triggers: ["거부"]
    },
    {
        message: "읽씹하는 건 예의가 아니지. 바쁘면 바쁘다고 말이라도 해줘.",
        before: "읽고 답장하지 않음",
        after: "무시당했다는 느낌",
        verdictMessage: "최소한의 예의는 지켜줘.",
        triggers: ["읽씹"]
    },
    {
        message: "혼자 신나서 계속 톡 보내는 거, 부담스러워. 숨 좀 쉬게 해줘.",
        before: "끊임없이 톡을 보냄",
        after: "부담감과 피로감 유발",
        verdictMessage: "적당한 거리가 필요해. 혼자 달리지 마.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "지금 너, 나한테 관심 있는 척 하는 거야? 아니면 그냥 심심한 거야?",
        before: "애매한 태도",
        after: "진심을 의심하게 됨",
        verdictMessage: "확실한 태도를 보여줘. 헷갈리게 하지 말고."
    },
    {
        message: "맨날 똑같은 얘기만 반복하는 거 지겨워. 새로운 얘기 좀 해봐.",
        before: "반복되는 대화 주제",
        after: "지루함 유발",
        verdictMessage: "신선함이 필요해. 변화를 시도해봐."
    },
    {
        message: "너 혹시 내가 만만해? 왜 자꾸 나한테 짜증 내는 거야?",
        before: "상대방의 짜증 섞인 말투",
        after: "만만하게 보는 듯한 태도에 대한 불쾌감",
        verdictMessage: "존중은 상호적인 거야. 함부로 대하지 마."
    },
    {
        message: "답장이 너무 느려. 나랑 대화하기 싫은 거 아니면, 좀 더 신경 써줘.",
        before: "느린 답장 속도",
        after: "관심 부족으로 느껴짐",
        verdictMessage: "답장 속도는 관심의 척도."
    },
    {
        message: "칭찬은 고마운데, 너무 과장됐어. 진심이 느껴지지 않아.",
        before: "과장된 칭찬",
        after: "진정성 의심",
        verdictMessage: "진심이 담긴 칭찬이 더 효과적이야."
    },
    {
        message: "자꾸 과거 얘기 꺼내는 거, 지금 뭐 하자는 거야? 과거는 과거일 뿐이야.",
        before: "과거 이야기 반복",
        after: "현재 관계에 대한 불만족 암시",
        verdictMessage: "과거에 얽매이지 마. 현재에 집중해."
    },
    {
        message: "나한테 맞춰주는 척 하지 마. 어색해. 그냥 솔직하게 말해줘.",
        before: "억지로 맞춰주는 태도",
        after: "어색함과 불편함 유발",
        verdictMessage: "솔직함이 편안함을 가져다줘."
    },
    {
        message: "너 혹시 내가 ATM이야? 왜 자꾸 돈 빌려달라는 말만 해?",
        before: "금전적인 요구",
        after: "이용당하는 느낌",
        verdictMessage: "돈독 오르면 끝이야. 선을 지켜."
    },
    {
        message: "술 마시고 연락하는 거, 솔직히 별로야. 제정신으로 얘기해.",
        before: "술 취한 상태로 연락",
        after: "진지함 결여로 느껴짐",
        verdictMessage: "술김에 하는 말은 믿을 수 없어."
    },
    {
        message: "나한테 훈계하는 말투 좀 고쳐. 짜증나니까.",
        before: "훈계하는 말투",
        after: "반감과 불쾌감 유발",
        verdictMessage: "가르치려 들지 마. 대화는 평등해야 해."
    },
    {
        message: "매번 똑같은 데이트 코스, 지겹다. 좀 새로운 거 생각해봐.",
        before: "반복적인 데이트 코스",
        after: "지루함 유발",
        verdictMessage: "새로운 시도가 관계를 활기차게 만들어."
    },
    {
        message: "나한테 모든 걸 다 털어놓는 거, 부담스러워. 나 쓰레기통 아니야.",
        before: "과도한 고민 상담",
        after: "부담감과 피로감 유발",
        verdictMessage: "적당한 거리를 유지해. 감정 쓰레기통이 되지 마."
    },
    {
        message: "맨날 남 험담만 하는 거, 듣기 싫어. 긍정적인 얘기 좀 해봐.",
        before: "남 험담",
        after: "불쾌함 유발",
        verdictMessage: "긍정적인 에너지가 중요해. 부정적인 사람은 피하게 돼."
    },
    {
        message: "너 혹시 연락할 사람이 나밖에 없어? 왜 이렇게 자주 연락해?",
        before: "지나치게 잦은 연락",
        after: "부담감 유발",
        verdictMessage: "혼자만의 시간도 존중해줘.",
        triggers: ["연속톡"]
    },
    {
        message: "나한테 의존하는 거, 이제 그만해. 혼자 할 수 있는 건 혼자 해.",
        before: "과도한 의존",
        after: "답답함과 짜증 유발",
        verdictMessage: "자립심을 키워. 의존적인 사람은 매력 없어."
    },
    {
        message: "나한테 거짓말하는 거, 다 티나. 솔직하게 말해.",
        before: "거짓말",
        after: "불신감 형성",
        verdictMessage: "거짓말은 관계를 파괴해. 솔직함이 중요해."
    },
    {
        message: "나한테 자꾸 자랑하는 거, 솔직히 질투나. 적당히 해.",
        before: "자랑",
        after: "질투심 유발",
        verdictMessage: "겸손함이 미덕이야. 자랑은 반감만 살 뿐."
    },
    {
        message: "나랑 약속해놓고 자꾸 딴 약속 잡는 거, 기분 나빠.",
        before: "약속 파기",
        after: "무시당했다는 느낌",
        verdictMessage: "약속은 신뢰의 기본이야. 함부로 어기지 마."
    },
    {
        message: "나한테 감정적으로 대하는 거, 이제 그만해. 이성적으로 얘기해.",
        before: "감정적인 태도",
        after: "불안함 유발",
        verdictMessage: "감정적으로 대하지 마. 이성적인 대화가 필요해."
    },
    {
        message: "나한테 변명만 늘어놓는 거, 듣기 싫어. 그냥 잘못했다고 말해.",
        before: "변명",
        after: "짜증 유발",
        verdictMessage: "솔직하게 잘못을 인정하는 게 더 나아."
    },
    {
        message: "나한테 칭찬을 강요하는 듯한 말투, 거북해. 억지로 칭찬하게 만들지 마.",
        before: "칭찬 강요",
        after: "불편함 유발",
        verdictMessage: "칭찬은 자발적으로 나와야 진심이 느껴져."
    },
    {
        message: "너 지금 나 테스트하는 거야? 왜 자꾸 떠보는 말을 해?",
        before: "떠보는 말투",
        after: "불안함과 의심 유발",
        verdictMessage: "믿음을 보여줘. 떠보지 마."
    },
    {
        message: "너 혹시 나 이용하는 거야? 왜 자꾸 부탁만 해?",
        before: "잦은 부탁",
        after: "이용당하는 느낌",
        verdictMessage: "이기적인 행동은 관계를 망쳐."
    },
    {
        message: "나한테 맞춰주는 척 하면서 속으로는 딴 생각하는 거 다 보여.",
        before: "겉과 속이 다른 행동",
        after: "불신감 형성",
        verdictMessage: "진심을 보여줘. 가식적인 행동은 티가 나."
    },
    {
        message: "너 지금 나한테 화풀이하는 거야? 왜 자꾸 짜증 섞인 말투로 말해?",
        before: "짜증 섞인 말투",
        after: "불쾌감 유발",
        verdictMessage: "감정 쓰레기통 취급하지 마. 화풀이는 용납 못 해."
    },
    {
        message: "나한테 자꾸 명령하는 말투, 기분 나빠. 존중하는 태도를 보여줘.",
        before: "명령조의 말투",
        after: "반감 유발",
        verdictMessage: "존중은 필수야. 명령하지 마."
    },
    {
        message: "너 혹시 나 질투하는 거야? 왜 자꾸 비꼬는 말을 해?",
        before: "비꼬는 말투",
        after: "불쾌감과 불편함 유발",
        verdictMessage: "긍정적인 마음을 가져. 질투는 독이야."
    },
    {
        message: "나한테 모든 걸 숨기는 거, 답답해. 솔직하게 말해.",
        before: "숨기는 행동",
        after: "불안함과 불신감 유발",
        verdictMessage: "솔직함이 신뢰를 쌓아."
    },
    {
        message: "나한테 자꾸 과거 연애 얘기하는 거, 지금 뭐 하자는 거야?",
        before: "과거 연애 이야기",
        after: "불안함과 질투심 유발",
        verdictMessage: "과거는 과거일 뿐. 현재에 집중해."
    },
    {
        message: "나한테 맞춰주는 척 하지 말고 그냥 솔직하게 싫다고 말해. 그게 더 편해.",
        before: "억지로 맞춰주는 행동",
        after: "불편함과 어색함 유발",
        verdictMessage: "솔직함이 편안함을 가져다줘."
    },
    {
        message: "너 혹시 나 가지고 노는 거야? 왜 자꾸 밀당해?",
        before: "밀당하는 태도",
        after: "불안함과 불쾌감 유발",
        verdictMessage: "진지하게 대해줘. 밀당은 유치해."
    },
    {
        message: "나한테 핑계만 대지 말고, 그냥 솔직하게 말해.",
        before: "핑계",
        after: "답답함과 짜증 유발",
        verdictMessage: "솔직함이 문제를 해결해."
    },
    {
        message: "너 혹시 나 무시하는 거야? 왜 자꾸 말 끊어?",
        before: "말 끊는 행동",
        after: "무시당했다는 느낌",
        verdictMessage: "존중하는 태도를 보여줘. 말을 함부로 끊지 마."
    },
    {
        message: "나한테 감정 쓰레기통 취급하지 마. 힘들어.",
        before: "감정 쓰레기통 취급",
        after: "피로감과 스트레스 유발",
        verdictMessage: "감정적인 교류가 필요해. 일방적인 배출은 안 돼."
    },
    {
        message: "너 혹시 나 떠보는 거야? 왜 자꾸 시험해?",
        before: "시험하는 행동",
        after: "불안함과 불쾌감 유발",
        verdictMessage: "믿음을 보여줘. 시험하지 마."
    },
    {
        message: "나한테 습관적으로 거짓말하는 거, 고쳐. 이제 안 믿어.",
        before: "습관적인 거짓말",
        after: "불신감 심화",
        verdictMessage: "신뢰를 잃으면 끝이야. 진실되게 행동해."
    },
    {
        message: "나한테 자꾸 과거 일 들춰내는 거, 그만해. 짜증나.",
        before: "과거 일 들춰냄",
        after: "불쾌감과 분노 유발",
        verdictMessage: "과거는 과거일 뿐. 현재를 망치지 마."
    },
    {
        message: "나한테 자꾸 불평불만만 늘어놓는 거, 듣기 싫어. 긍정적인 면 좀 봐.",
        before: "불평불만",
        after: "피로감과 부정적인 감정 유발",
        verdictMessage: "긍정적인 마음을 가져. 부정적인 사람은 멀리하게 돼."
    },
    {
        message: "너 혹시 나 이용하는 거야? 왜 자꾸 돈 빌려달라고 해?",
        before: "잦은 금전 요구",
        after: "이용당하는 느낌",
        verdictMessage: "돈독 오르면 끝이야. 관계를 망치지 마."
    },
    {
        message: "나한테 감정적으로 호소하는 거, 이제 안 통해. 이성적으로 설득해.",
        before: "감정적인 호소",
        after: "불신감과 피로감 유발",
        verdictMessage: "이성적인 대화가 필요해. 감정적인 호소는 통하지 않아."
    },
    {
        message: "계속 '네' '아니오' 단답만 할 거면 그냥 챗봇이랑 대화하는 게 낫겠네. 시간 아깝다.",
        before: "상대방의 계속되는 단답형 대화",
        after: "상대방의 무관심 혹은 대화 의지 부족",
        verdictMessage: "대화 방식에 대한 불만. 관계 개선의 필요성.",
        triggers: ["단답"]
    },
    {
        message: "ㅋㅋㅋ 도배하는 거 보니 할 말 없다는 뜻으로 밖에 안 보여. 진심으로 웃긴 거 맞아?",
        before: "상대방의 과도한 'ㅋㅋㅋ' 사용",
        after: "상대방의 대화 회피 혹은 무성의",
        verdictMessage: "성의 없는 대화 태도 지적. 진지한 대화 필요.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모지만 계속 보내는 건 대화하기 싫다는 표현으로 밖에 안 들려. 솔직히 말해봐, 귀찮지?",
        before: "상대방의 과도한 이모티콘 사용",
        after: "상대방의 대화 회피 혹은 불쾌감",
        verdictMessage: "솔직한 감정 표현 요구. 대화 방식 재고 필요.",
        triggers: ["이모지"]
    },
    {
        message: "혼자 장문톡 보내고 답장 기다리는 거 지친다. 내가 지금 일방적으로 좋아하는 것 같잖아.",
        before: "혼자 장문의 메시지를 보냄",
        after: "관계의 불균형을 느낌",
        verdictMessage: "관계의 균형을 맞춰야 함. 상대방의 적극적인 참여 필요.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "질문만 계속 던지지 말고 너도 좀 얘기해봐. 심문하는 것도 아니고.",
        before: "상대방의 계속되는 질문",
        after: "상대방의 소극적인 태도 혹은 정보 캐묻기",
        verdictMessage: "상호적인 대화 필요. 질문과 답변의 균형.",
        triggers: ["질문"]
    },
    {
        message: "읽씹은 좀 너무한 거 아니야? 바쁜 건 알겠는데, 최소한의 예의는 지켜줘.",
        before: "상대방의 읽씹",
        after: "상대방의 무시 혹은 소홀함",
        verdictMessage: "최소한의 예의 요구. 관계 개선의 필요성.",
        triggers: ["읽씹"]
    },
    {
        message: "매번 내가 먼저 연락해야 하는 거야? 너는 나한테 관심 없어?",
        before: "매번 자신이 먼저 연락함",
        after: "상대방의 무관심 혹은 소극적인 태도",
        verdictMessage: "관계의 주도권 문제. 상대방의 적극적인 참여 필요.",
        triggers: ["연속톡"]
    },
    {
        message: "미안한데, 지금 네 얘기 하나도 재미없어. 다른 얘기 좀 하면 안 될까?",
        before: "상대방의 지루한 이야기",
        after: "상대방의 자기중심적인 대화",
        verdictMessage: "대화 주제 변경 요구. 상호적인 관심사 공유 필요."
    },
    {
        message: "그렇게 뜸 들이다가 답장할 거면 그냥 안 하는 게 나을지도 몰라.",
        before: "상대방의 매우 느린 답장 속도",
        after: "상대방의 무관심 혹은 우선순위 낮음",
        verdictMessage: "답장 속도에 대한 불만. 관계 개선의 필요성."
    },
    {
        message: "자꾸 회피하는 거 보니까 뭔가 숨기는 거 있지? 솔직하게 말해봐.",
        before: "상대방의 회피적인 태도",
        after: "상대방의 숨기는 사실 혹은 불안함",
        verdictMessage: "솔직한 대화 요구. 신뢰 구축의 필요성.",
        triggers: ["거부"]
    },
    {
        message: "나 지금 너 위로해줘야 하는 거야? 아니면 그냥 하소연 들어주는 로봇이야?",
        before: "상대방의 일방적인 하소연",
        after: "상대방의 감정 쓰레기통 취급",
        verdictMessage: "감정적인 교류 요구. 공감과 위로의 균형 필요.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "네 감정 기복에 맞춰주는 거 이제 좀 힘들다. 나도 내 감정이 있거든.",
        before: "상대방의 심한 감정 기복",
        after: "상대방의 감정적인 의존",
        verdictMessage: "감정적인 독립 요구. 자신의 감정도 중요."
    },
    {
        message: "계속 그런 식으로 대답하면 더 이상 대화하고 싶지 않아질 것 같아.",
        before: "상대방의 불성실한 대답",
        after: "상대방의 무관심 혹은 무례함",
        verdictMessage: "대화 태도 개선 요구. 존중하는 태도 필요.",
        triggers: ["단답","거부"]
    },
    {
        message: "나한테 기대는 건 좋은데, 너무 의존하는 건 좀 곤란해.",
        before: "상대방의 과도한 의존",
        after: "상대방의 독립성 부족",
        verdictMessage: "적절한 의존 필요. 자립심 강화 요구."
    },
    {
        message: "계속 똑같은 말만 반복하는 거 보니까 지겹다. 새로운 이야기 좀 해봐.",
        before: "상대방의 반복적인 이야기",
        after: "상대방의 지루함 혹은 화제 고갈",
        verdictMessage: "새로운 화제 필요. 대화의 다양성 요구."
    },
    {
        message: "너 지금 나랑 대화하는 거 귀찮지? 솔직하게 말해도 괜찮아.",
        before: "상대방의 귀찮아하는 태도",
        after: "상대방의 무관심 혹은 피로감",
        verdictMessage: "솔직한 감정 표현 요구. 대화 중단 가능성."
    },
    {
        message: "나도 할 말 많은데, 너만 계속 얘기하니까 답답하다.",
        before: "상대방의 독점적인 대화",
        after: "상대방의 자기중심적인 태도",
        verdictMessage: "상호적인 대화 필요. 발언 기회의 균등.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "그렇게 부정적으로만 말하면 누가 너랑 대화하고 싶겠어?",
        before: "상대방의 부정적인 태도",
        after: "상대방의 비관적인 성향",
        verdictMessage: "긍정적인 태도 요구. 대화 분위기 개선 필요."
    },
    {
        message: "너 답장하는 거 보면 숙제하는 것 같아. 재미없어.",
        before: "상대방의 성의 없는 답장",
        after: "상대방의 무관심 혹은 피로감",
        verdictMessage: "대화 태도 개선 요구. 즐거운 대화 필요.",
        triggers: ["단답"]
    },
    {
        message: "계속 그런 식으로 변명만 늘어놓으면 누가 널 믿어주겠어?",
        before: "상대방의 계속되는 변명",
        after: "상대방의 책임 회피 혹은 불안함",
        verdictMessage: "솔직한 인정 요구. 책임감 있는 태도 필요."
    },
    {
        message: "나도 바쁜데, 네 시시콜콜한 얘기까지 다 들어줘야 해?",
        before: "상대방의 사소한 이야기",
        after: "상대방의 과도한 관심 요구",
        verdictMessage: "적절한 거리 유지 필요. 자신의 시간도 중요."
    },
    {
        message: "너 지금 나 테스트하는 거야? 왜 자꾸 떠보는 말만 해?",
        before: "상대방의 떠보는 질문",
        after: "상대방의 불안함 혹은 의심",
        verdictMessage: "솔직한 마음 표현 요구. 신뢰 구축의 필요성.",
        triggers: ["질문"]
    },
    {
        message: "네 뻔한 거짓말 이제 안 통해. 솔직하게 말해.",
        before: "상대방의 거짓말",
        after: "상대방의 불안함 혹은 상황 회피",
        verdictMessage: "진실된 대화 요구. 신뢰 회복 필요."
    },
    {
        message: "자꾸 말 돌리지 말고 핵심만 말해. 답답해 죽겠네.",
        before: "상대방의 애매모호한 답변",
        after: "상대방의 숨기는 의도 혹은 불안함",
        verdictMessage: "명확한 답변 요구. 솔직한 대화 필요.",
        triggers: ["거부"]
    },
    {
        message: "너 지금 나 무시하는 거야? 왜 대답이 없어?",
        before: "상대방의 무응답",
        after: "상대방의 무관심 혹은 무시",
        verdictMessage: "답변 요구. 존중하는 태도 필요.",
        triggers: ["읽씹"]
    },
    {
        message: "매번 똑같은 패턴으로 연락하는 거 지겹다. 새로운 모습 좀 보여줘.",
        before: "상대방의 예측 가능한 행동",
        after: "상대방의 매력 부족 혹은 변화 없음",
        verdictMessage: "새로운 모습 요구. 관계 개선의 필요성."
    },
    {
        message: "너 지금 나한테 화풀이하는 거야? 왜 짜증 내?",
        before: "상대방의 짜증",
        after: "상대방의 불만 혹은 스트레스",
        verdictMessage: "감정 조절 요구. 존중하는 태도 필요."
    },
    {
        message: "나도 힘든데, 네 징징거림까지 들어줘야 해?",
        before: "상대방의 징징거림",
        after: "상대방의 감정적인 의존",
        verdictMessage: "감정적인 독립 요구. 자신의 감정도 중요."
    },
    {
        message: "너 지금 나 질투하는 거야? 왜 그렇게 삐딱하게 말해?",
        before: "상대방의 비꼬는 말투",
        after: "상대방의 질투 혹은 불만",
        verdictMessage: "솔직한 감정 표현 요구. 긍정적인 태도 필요."
    },
    {
        message: "그렇게 계산적으로 행동하면 누가 널 좋아하겠어?",
        before: "상대방의 계산적인 행동",
        after: "상대방의 이기적인 성향",
        verdictMessage: "진심으로 대하기 요구. 관계 개선의 필요성."
    },
    {
        message: "너 지금 나 가르치려고 드는 거야? 왜 훈계질이야?",
        before: "상대방의 훈계",
        after: "상대방의 우월감 혹은 통제 욕구",
        verdictMessage: "존중하는 태도 요구. 수평적인 관계 필요."
    },
    {
        message: "자꾸 과거 얘기 꺼내지 마. 지금 중요한 건 현재잖아.",
        before: "상대방의 과거 이야기",
        after: "상대방의 후회 혹은 미련",
        verdictMessage: "현재에 집중 요구. 건설적인 대화 필요."
    },
    {
        message: "너 지금 나한테 기대하는 게 너무 많은 것 같아. 부담스러워.",
        before: "상대방의 과도한 기대",
        after: "상대방의 의존적인 성향",
        verdictMessage: "적절한 거리 유지 필요. 자신의 한계 인정."
    },
    {
        message: "그렇게 쉽게 포기하면 아무것도 이룰 수 없어.",
        before: "상대방의 쉬운 포기",
        after: "상대방의 의지 부족 혹은 회피",
        verdictMessage: "끈기 있는 태도 요구. 목표 달성 노력 필요."
    },
    {
        message: "너 지금 나 시험하는 거야? 왜 자꾸 어려운 질문만 해?",
        before: "상대방의 어려운 질문",
        after: "상대방의 불안함 혹은 의심",
        verdictMessage: "솔직한 마음 표현 요구. 신뢰 구축의 필요성.",
        triggers: ["질문"]
    },
    {
        message: "자꾸 남 탓하지 마. 문제의 원인은 너에게도 있어.",
        before: "상대방의 남 탓",
        after: "상대방의 책임 회피 혹은 자기 합리화",
        verdictMessage: "자기 반성 요구. 책임감 있는 태도 필요."
    },
    {
        message: "너 지금 나한테 뭘 바라는 거야? 솔직하게 말해.",
        before: "상대방의 숨기는 의도",
        after: "상대방의 불안함 혹은 욕망",
        verdictMessage: "솔직한 마음 표현 요구. 관계 개선의 필요성."
    },
    {
        message: "그렇게 고집 부리면 결국 후회할 거야.",
        before: "상대방의 고집",
        after: "상대방의 미성숙함 혹은 오만함",
        verdictMessage: "유연한 태도 요구. 다양한 의견 수용 필요."
    },
    {
        message: "너 지금 나랑 싸우고 싶은 거야? 왜 시비 걸어?",
        before: "상대방의 시비",
        after: "상대방의 불만 혹은 공격적인 성향",
        verdictMessage: "감정 조절 요구. 존중하는 태도 필요."
    },
    {
        message: "나도 힘든데, 네 어두운 면까지 다 받아줘야 해?",
        before: "상대방의 어두운 면",
        after: "상대방의 감정적인 의존",
        verdictMessage: "감정적인 독립 요구. 자신의 감정도 중요."
    },
    {
        message: "그렇게 비관적으로 생각하면 아무것도 시작할 수 없어.",
        before: "상대방의 비관적인 생각",
        after: "상대방의 불안함 혹은 두려움",
        verdictMessage: "긍정적인 태도 요구. 도전 정신 필요."
    },
    {
        message: "너 지금 나 이용하는 거야? 왜 자꾸 부탁만 해?",
        before: "상대방의 잦은 부탁",
        after: "상대방의 이기적인 성향",
        verdictMessage: "자립심 강화 요구. 자신의 힘으로 해결 노력 필요."
    },
    {
        message: "그렇게 쉽게 화내면 누가 너랑 같이 있겠어?",
        before: "상대방의 잦은 분노",
        after: "상대방의 감정 조절 미숙",
        verdictMessage: "감정 조절 요구. 평온한 관계 유지 필요."
    },
    {
        message: "너 지금 나한테 실망했어? 왜 쌀쌀맞게 대해?",
        before: "상대방의 차가운 태도",
        after: "상대방의 실망 혹은 불만",
        verdictMessage: "솔직한 감정 표현 요구. 관계 개선의 필요성."
    },
    {
        message: "그렇게 과거에 얽매여 있으면 앞으로 나아갈 수 없어.",
        before: "상대방의 과거에 대한 집착",
        after: "상대방의 후회 혹은 미련",
        verdictMessage: "미래 지향적인 태도 요구. 현재에 집중 필요."
    },
    {
        message: "너 지금 나한테 뭘 숨기는 거야? 왜 솔직하게 말 안 해?",
        before: "상대방의 숨기는 태도",
        after: "상대방의 불안함 혹은 의심",
        verdictMessage: "솔직한 마음 표현 요구. 신뢰 구축의 필요성."
    },
    {
        message: "그렇게 변덕스러우면 누가 널 믿고 따르겠어?",
        before: "상대방의 변덕스러운 태도",
        after: "상대방의 신뢰도 하락",
        verdictMessage: "일관성 있는 태도 요구. 신뢰 회복 필요."
    },
    {
        message: "답장은 꼬박꼬박 하는데, 딱 거기까지. 더 이상의 발전은 기대하지 마.",
        before: "답장은 빠르지만, 질문 없이 대화가 끊김",
        after: "관심은 없지만, 예의는 차리는 중",
        verdictMessage: "쏘 쏘. 그냥 아는 사이",
        triggers: ["단답","질문"]
    },
    {
        message: "너만 신났네. 상대방은 지금 영혼 없이 이모티콘만 날리는 중.",
        before: "혼자 장문 쓰고, 상대방은 이모티콘으로만 반응",
        after: "대화 참여 의지 없음",
        verdictMessage: "벽 보고 얘기하는 기분일 듯",
        triggers: ["장문","이모지","혼자떠듦"]
    },
    {
        message: "연락은 하는데, 숙제하는 기분이겠다. 억지로 이어가는 느낌.",
        before: "매일 같은 시간에 형식적인 안부 인사",
        after: "지루함, 의무감",
        verdictMessage: "권태기 or 그냥 친구",
        triggers: ["질문"]
    },
    {
        message: "답장이 늦는 건 늦는 건데, 내용도 성의 없어. 우선순위에서 밀린 듯.",
        before: "답장 3시간 이상 늦고, 단답형",
        after: "귀찮음, 다른 일에 집중",
        verdictMessage: "후순위. 잊혀짐",
        triggers: ["단답","읽씹"]
    },
    {
        message: "ㅋㅋㅋ 도배는 그만. 진심이 느껴지지 않아. 가벼워 보일 뿐.",
        before: "모든 문장에 ㅋㅋㅋ 남발",
        after: "진지함 결여",
        verdictMessage: "가벼운 관계",
        triggers: ["많은ㅋ"]
    },
    {
        message: "너 혼자 북 치고 장구 치고 다 하네. 상대방 반응 좀 살펴.",
        before: "계속 질문만 던지고, 상대방은 대답만 함",
        after: "피로감, 부담감",
        verdictMessage: "혼자만의 착각일 수도",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "이모티콘으로 대화 퉁치려는 거, 눈치 못 챌 거라고 생각하지 마.",
        before: "대화 내용 없이 이모티콘만 보냄",
        after: "회피, 귀찮음",
        verdictMessage: "대화 거부",
        triggers: ["이모지","단답"]
    },
    {
        message: "답장은 바로 오는데, 핑퐁이 안 돼. 네 말만 하고 끝나는 느낌.",
        before: "빠른 답장, 하지만 질문 없이 자기 할 말만 함",
        after: "자기 중심적",
        verdictMessage: "소통 부족",
        triggers: ["혼자떠듦"]
    },
    {
        message: "계속 '응', '아' 만 하는 거 보니, 너랑 대화하기 싫은가 봐.",
        before: "'응', '아' 등 단답만 반복",
        after: "무관심, 짜증",
        verdictMessage: "대화 종료 신호",
        triggers: ["단답"]
    },
    {
        message: "네 장문 카톡에 상대방은 지금 질려 있을지도 몰라. 간결하게 요약해.",
        before: "혼자만 장문 메시지",
        after: "지루함, 압박감",
        verdictMessage: "장문은 부담",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "그렇게 계속 물어보면 부담스러워서 도망갈지도 몰라. 거리를 둬.",
        before: "계속해서 질문 공세",
        after: "압박감, 불편함",
        verdictMessage: "과도한 관심은 독",
        triggers: ["질문","연속톡"]
    },
    {
        message: "읽고 답이 없다는 건, 지금 당장은 너에게 신경 쓸 여유가 없다는 뜻이야.",
        before: "읽씹 후 몇 시간 뒤 답장",
        after: "무시, 바쁨",
        verdictMessage: "우선순위 낮음",
        triggers: ["읽씹"]
    },
    {
        message: "상대방은 지금 네 연락을 '확인'만 하고 싶어하는 것 같아.",
        before: "읽음 표시는 사라지지만, 답장은 없음",
        after: "무시, 묵살",
        verdictMessage: "무관심",
        triggers: ["읽씹"]
    },
    {
        message: "너만 신나서 쉴 새 없이 보내는 카톡, 상대방은 지금 알람 끄고 싶을 거야.",
        before: "혼자 연속적으로 카톡 보내기",
        after: "피로감, 짜증",
        verdictMessage: "카톡 감옥",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "답장은 해주지만, 대화 주제를 계속 바꾸네. 너와의 대화를 피하고 있는 걸지도.",
        before: "대화 주제가 계속 바뀜",
        after: "회피, 불편함",
        verdictMessage: "대화 거부",
        triggers: ["거부"]
    },
    {
        message: "질문만 쏟아내지 말고, 네 이야기도 좀 해봐. 앵무새 같잖아.",
        before: "계속 질문만 함",
        after: "수동적, 답답함",
        verdictMessage: "매력 없음",
        triggers: ["질문"]
    },
    {
        message: "단답형 대답만 돌아오는 거 보니, 너에게 할 말이 별로 없는 것 같아.",
        before: "계속 단답형으로 대답",
        after: "무관심, 귀찮음",
        verdictMessage: "대화 단절",
        triggers: ["단답"]
    },
    {
        message: "너무 들이대면 도망가. 조금만 속도를 늦춰.",
        before: "매일 연락하고, 계속 만나자고 함",
        after: "부담감, 압박감",
        verdictMessage: "과유불급",
        triggers: ["연속톡"]
    },
    {
        message: "지금 네 대화는 일방통행이야. 상대방 의견도 좀 물어봐.",
        before: "자기 이야기만 계속 함",
        after: "이기적, 독선적",
        verdictMessage: "소통 불가",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대방은 너의 '착함'에 익숙해져 버린 것 같아. 가끔은 싫은 티도 내.",
        before: "무조건 다 받아줌",
        after: "만만하게 봄",
        verdictMessage: "호구"
    },
    {
        message: "선톡은 네가 먼저 하는데, 대화는 항상 똑같네. 변화를 줘 봐.",
        before: "매번 같은 내용으로 선톡",
        after: "지루함, 식상함",
        verdictMessage: "매력 없음",
        triggers: ["질문"]
    },
    {
        message: "답장 속도가 들쭉날쭉한 건, 너와의 대화가 우선순위가 아니라는 뜻이야.",
        before: "답장 속도가 불규칙적",
        after: "변덕, 무시",
        verdictMessage: "애매한 관계",
        triggers: ["읽씹"]
    },
    {
        message: "이모티콘만 남발하는 건, 할 말이 없거나, 너와의 대화가 불편하다는 뜻일 수도 있어.",
        before: "계속 이모티콘만 보냄",
        after: "회피, 불편함",
        verdictMessage: "대화 거부",
        triggers: ["이모지"]
    },
    {
        message: "너의 장황한 이야기에 상대방은 지금 '세 줄 요약'을 외치고 있을지도 몰라.",
        before: "혼자 장문으로 넋두리",
        after: "지루함, 짜증",
        verdictMessage: "정보 과다",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "카톡으로만 모든 걸 해결하려 하지 마. 직접 만나서 대화하는 게 훨씬 효과적일 거야.",
        before: "카톡으로만 연락",
        after: "피상적인 관계",
        verdictMessage: "관계 발전 어려움"
    },
    {
        message: "상대방은 너의 질문에 '네' 아니면 '아니오' 로만 대답하네. 대화가 너무 뻔해.",
        before: "단답형 질문에 단답형 대답",
        after: "지루함, 답답함",
        verdictMessage: "노잼",
        triggers: ["질문","단답"]
    },
    {
        message: "상대방이 너의 카톡을 읽씹하는 시간이 점점 길어지고 있어. 무슨 문제인지 생각해 봐.",
        before: "읽씹 시간이 점점 길어짐",
        after: "무관심 증가",
        verdictMessage: "관계 악화",
        triggers: ["읽씹"]
    },
    {
        message: "너만 계속 칭찬하는 건, 칭찬 말고는 할 말이 없다는 뜻일 수도 있어.",
        before: "계속 칭찬만 함",
        after: "피상적인 관계",
        verdictMessage: "진전 없음"
    },
    {
        message: "상대방은 너의 연락에 억지로 답장하는 것 같아. 좀 더 신중하게 다가가.",
        before: "성의 없는 답장",
        after: "피로감, 짜증",
        verdictMessage: "관계 위기",
        triggers: ["단답"]
    },
    {
        message: "매번 같은 패턴의 대화는 지루해. 새로운 주제를 시도해 봐.",
        before: "매번 똑같은 내용의 대화",
        after: "지루함, 식상함",
        verdictMessage: "매력 없음"
    },
    {
        message: "너의 카톡에 상대방은 지금 '알림 끄기' 버튼을 누르고 싶을지도 몰라.",
        before: "너무 잦은 연락",
        after: "피로감, 짜증",
        verdictMessage: "과도한 관심은 독",
        triggers: ["연속톡"]
    },
    {
        message: "상대방은 너의 질문에 빙빙 돌려 말하네. 솔직한 감정을 숨기고 있는 것 같아.",
        before: "애매모호한 답변",
        after: "불편함, 회피",
        verdictMessage: "진실성 부족",
        triggers: ["거부","질문"]
    },
    {
        message: "너만 계속 궁금한 걸 물어보는 건, 상대방을 심문하는 것처럼 느껴질 수 있어.",
        before: "계속 질문만 함",
        after: "압박감, 불편함",
        verdictMessage: "취조",
        triggers: ["질문"]
    },
    {
        message: "상대방은 너의 카톡에 짧게 답장하고, 바로 다른 이야기를 꺼내네. 너와의 대화를 빨리 끝내고 싶어하는 것 같아.",
        before: "짧은 답장 후 화제 전환",
        after: "회피, 불편함",
        verdictMessage: "대화 거부",
        triggers: ["단답","거부"]
    },
    {
        message: "상대방은 너의 유머에 전혀 반응이 없네. 웃음 코드가 안 맞는 걸 수도 있어.",
        before: "혼자 유머 구사",
        after: "어색함, 당황",
        verdictMessage: "개그 실패",
        triggers: ["혼자떠듦"]
    },
    {
        message: "너만 계속 긍정적인 이야기를 하는 건, 진솔함이 부족해 보일 수 있어.",
        before: "계속 긍정적인 말만 함",
        after: "가식적, 불편함",
        verdictMessage: "진정성 의심"
    },
    {
        message: "상대방은 너의 사소한 질문에 굳이 답장하지 않네. 그만큼 너에게 큰 관심이 없는 걸지도 몰라.",
        before: "사소한 질문에 무응답",
        after: "무관심",
        verdictMessage: "존재감 희미",
        triggers: ["질문","읽씹"]
    },
    {
        message: "너의 장문 카톡에 상대방은 '읽기 귀찮다' 라고 생각하고 있을지도 몰라.",
        before: "혼자 장문 메시지",
        after: "지루함, 부담감",
        verdictMessage: "가독성 제로",
        triggers: ["장문"]
    },
    {
        message: "상대방은 너의 연락을 기다리는 것 같지는 않아. 조금은 거리를 두는 게 좋을 것 같아.",
        before: "선톡 빈도 낮음, 답장 늦음",
        after: "무관심, 귀찮음",
        verdictMessage: "소외감",
        triggers: ["읽씹"]
    }
];

// NEGATIVE_MEDIUM: 15~29점 (200개 목표, 현재 20개)
const NEGATIVE_MEDIUM = [
    {
        message: "네, 알겠습니다? 앵무새세요? 당신 감정은 대체 어디 팔아먹었습니까?",
        before: "상대방이 '네, 알겠습니다'라고 답함",
        after: "당신 대화에 대한 흥미 급감",
        verdictMessage: "단답형 대화, 관계 발전 가능성 희박",
        triggers: ["단답"]
    },
    {
        message: "ㅋㅋㅋㅋㅋ 3개 이상? 웃음이 헤퍼요. 진지함 제로. 가벼워 보이기 딱 좋음.",
        before: "상대방이 'ㅋㅋㅋㅋㅋ'를 사용",
        after: "당신을 만만하게 생각",
        verdictMessage: "과도한 ㅋ 사용, 신뢰도 하락",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘 도배질? 유치함 + 매력 없음 콤보. 할 말 없으면 그냥 입 다무세요.",
        before: "상대방이 과도한 이모티콘 사용",
        after: "당신에게 매력 어필 실패",
        verdictMessage: "이모티콘 남발, 대화 수준 저하",
        triggers: ["이모지"]
    },
    {
        message: "혼자 장문톡? 벽 보고 얘기하는 기분. 상대방 숨 막히게 하는 재주 있네.",
        before: "혼자만 장문의 메시지를 보냄",
        after: "상대방의 대화 참여 의지 상실",
        verdictMessage: "일방적인 대화, 소통 단절",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "질문만 던지지 말고, 당신 얘기도 좀 해봐요. 취조 받는 기분입니다.",
        before: "계속 질문만 함",
        after: "상대방이 방어적인 태도 취함",
        verdictMessage: "과도한 질문 공세, 불편함 유발",
        triggers: ["질문"]
    },
    {
        message: "답장 3시간 딜레이? 당신 우선순위는 저 밑바닥인가 보네요.",
        before: "답장이 3시간 이상 늦어짐",
        after: "상대방의 애정 식음",
        verdictMessage: "늦은 답장, 무관심 표현",
        triggers: ["읽씹"]
    },
    {
        message: "혼자 5톡 이상? 스토커세요? 상대방 질릴 틈을 주지 않네.",
        before: "혼자서 5개 이상의 메시지를 보냄",
        after: "상대방이 부담감을 느낌",
        verdictMessage: "과도한 연락, 관계 악화",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "단답 + 이모티콘? 대화하기 싫다는 완곡한 표현. 눈치 챙기세요.",
        before: "단답형 답변과 이모티콘 사용",
        after: "상대방이 대화 종료를 원함",
        verdictMessage: "대화 거부 신호, 관계 위기",
        triggers: ["단답","이모지"]
    },
    {
        message: "\"바빠서\"라는 핑계, 이제 안 통합니다. 시간 없으면 연애할 자격도 없어요.",
        before: "상대방이 바쁘다는 핑계를 댐",
        after: "당신에 대한 관심 부족으로 해석됨",
        verdictMessage: "회피성 답변, 관계 소홀",
        triggers: ["거부"]
    },
    {
        message: "\"나중에\"라는 말, 무기한 연기 선언. 기대 접으세요.",
        before: "상대방이 '나중에'라는 말을 사용",
        after: "상대방이 약속을 지킬 의지가 없음",
        verdictMessage: "약속 회피, 신뢰도 하락",
        triggers: ["거부"]
    },
    {
        message: "미안하다는 말만 반복? 습관성 사과, 진정성 제로.",
        before: "사과를 반복함",
        after: "상대방이 당신을 가볍게 여김",
        verdictMessage: "진정성 없는 사과, 관계 개선 실패"
    },
    {
        message: "상대방이 질문에 질문으로 답하면, 대화 거부 신호. 눈치껏 빠지세요.",
        before: "상대방이 질문에 질문으로 답함",
        after: "상대방이 당신과의 대화를 피하려고 함",
        verdictMessage: "대화 회피, 관계 단절",
        triggers: ["거부","질문"]
    },
    {
        message: "네, 아니오만 반복? 로봇이랑 대화하는 기분. 감정 공유는 바라지도 마세요.",
        before: "네, 아니오로만 대답함",
        after: "상대방이 당신에게 마음을 열지 않음",
        verdictMessage: "단답형 대화, 감정 교류 불가",
        triggers: ["단답"]
    },
    {
        message: "읽고 3일 뒤 답장? 당신은 이미 아웃 오브 안중.",
        before: "3일 뒤 답장",
        after: "상대방은 당신에게 관심 없음",
        verdictMessage: "무시, 관계 종료 임박",
        triggers: ["읽씹"]
    },
    {
        message: "\"피곤해\" 한 마디로 대화 종료? 당신은 그냥 에너지 뱀파이어.",
        before: "피곤하다는 말로 대화 종료",
        after: "상대방은 당신과의 대화를 부담스러워 함",
        verdictMessage: "대화 회피, 관계 악화",
        triggers: ["거부"]
    },
    {
        message: "계속 같은 얘기만 반복? 지루함 MAX. 새로운 주제를 찾거나, 헤어지거나.",
        before: "같은 이야기 반복",
        after: "상대방이 지루함을 느낌",
        verdictMessage: "반복적인 대화, 흥미 상실"
    },
    {
        message: "과거 연애 얘기만 꺼내는 건, 현재에 대한 불만족의 표현. 지금 당신은 대체?",
        before: "과거 연애 이야기 언급",
        after: "현재 관계에 대한 불만족",
        verdictMessage: "과거 회상, 현재 관계 불만"
    },
    {
        message: "답장은 칼답인데 내용은 건성? 영혼 없는 대화는 집어치우세요.",
        before: "빠른 답장이지만 내용이 부실함",
        after: "상대방이 당신과의 대화에 집중하지 않음",
        verdictMessage: "건성 대화, 무성의함",
        triggers: ["단답"]
    },
    {
        message: "뜬금없는 새벽 감성 폭발? 관심 구걸로밖에 안 보임.",
        before: "새벽에 감성적인 메시지 전송",
        after: "관심을 갈구하는 행동으로 비춰짐",
        verdictMessage: "감성 과잉, 매력 감소"
    },
    {
        message: "\"잘 자\" 한 마디 툭 던지고 끝? 성의 없음. 최소한 꿈 얘기라도 해줘.",
        before: "잘 자라는 인사만 하고 대화 종료",
        after: "상대방이 무관심하다고 느낄 수 있음",
        verdictMessage: "성의 없는 마무리, 관계 소홀",
        triggers: ["단답"]
    },
    {
        message: "선톡은 절대 안 하고 답톡만? 당신을 그냥 심심풀이 땅콩으로 생각하는 듯.",
        before: "상대방은 답톡만 함",
        after: "상대방은 당신에게 적극적인 관심 없음",
        verdictMessage: "수동적인 태도, 관계 발전 저해"
    },
    {
        message: "약속 잡을 때마다 회피? 데이트 비용 아까워하는 거 티 내지 마세요.",
        before: "만남을 회피함",
        after: "당신과의 데이트를 꺼려함",
        verdictMessage: "만남 거부, 관계 위기",
        triggers: ["거부"]
    },
    {
        message: "상대방의 관심사를 전혀 모르는 대화? 공감 능력 제로.",
        before: "상대방의 관심사를 모름",
        after: "상대방이 당신과의 대화에 흥미를 잃음",
        verdictMessage: "공감 부족, 소통 불가"
    },
    {
        message: "\"오늘 뭐 했어?\" 말고는 할 말 없음? 대화 센스 빵점.",
        before: "매번 똑같은 질문만 함",
        after: "상대방이 지루함을 느낌",
        verdictMessage: "진부한 질문, 대화의 질 저하",
        triggers: ["질문"]
    },
    {
        message: "사진만 보내고 말 없음? 벙어리세요? 최소한 설명이라도 덧붙여.",
        before: "사진만 보내고 설명 없음",
        after: "상대방이 당신의 의도를 파악하기 어려워함",
        verdictMessage: "불통, 관계 발전 저해",
        triggers: ["단답"]
    },
    {
        message: "읽씹 후 며칠 뒤 '미안' 한마디? 퉁치려는 수작. 괘씸죄 추가.",
        before: "읽씹 후 뒤늦은 사과",
        after: "상대방이 당신의 성의 없음에 실망함",
        verdictMessage: "성의 없는 사과, 관계 악화",
        triggers: ["읽씹"]
    },
    {
        message: "갑자기 연락 끊고 잠수? 이별 통보인가요? 최소한 예의는 지키세요.",
        before: "갑자기 연락 두절",
        after: "상대방이 버려졌다고 느낄 수 있음",
        verdictMessage: "잠수 이별, 무책임함"
    },
    {
        message: "대화 주제가 항상 당신 위주? 이기적인 사람 딱 질색.",
        before: "대화 주제가 항상 자신 위주",
        after: "상대방이 소외감을 느낄 수 있음",
        verdictMessage: "이기적인 대화, 관계 악화",
        triggers: ["혼자떠듦"]
    },
    {
        message: "술 취해서 횡설수설? 다음 날 후회할 짓은 왜 하는 거죠?",
        before: "술 취한 상태로 연락",
        after: "상대방에게 실망감을 안겨줄 수 있음",
        verdictMessage: "음주 후 실수, 관계 악영향"
    },
    {
        message: "비꼬는 말투, 빈정거리는 표현? 정 떨어지는 소리 좀 그만하세요.",
        before: "비꼬는 말투 사용",
        after: "상대방이 불쾌감을 느낄 수 있음",
        verdictMessage: "부정적인 말투, 관계 악화"
    },
    {
        message: "\"ㅋㅋㅋ\" 남발하면서 할 말 다 하는 스타일? 가벼워 보입니다. 좀 자제하세요.",
        before: "많은 ㅋ 사용과 할 말 다 함",
        after: "가벼워 보일 수 있음",
        verdictMessage: "가벼운 인상, 신뢰도 하락",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대방이 좋아하는 것 = 내가 좋아하는 것? 주체성이 없어요.",
        before: "상대방의 취향에 무조건 동조",
        after: "주체성 부족으로 매력 감소",
        verdictMessage: "주체성 결여, 매력 감소"
    },
    {
        message: "\"아\", \"응\" 같은 단답 뒤에 이모지만 붙이는 건 대체 무슨 심리?",
        before: "단답 뒤 이모티콘",
        after: "상대방과의 대화 의지 부족으로 해석될 수 있음",
        verdictMessage: "성의 없는 대화, 관계 발전 저해",
        triggers: ["단답","이모지"]
    },
    {
        message: "매번 답장이 1시간 이상 늦는 건, 그냥 당신이 뒷전이라는 증거.",
        before: "1시간 이상 늦은 답장",
        after: "상대방에게 무관심으로 비춰짐",
        verdictMessage: "무관심, 관계 소홀",
        triggers: ["읽씹"]
    },
    {
        message: "상대방이 질문하면 딴 얘기? 회피형 인간인가요?",
        before: "질문에 딴 이야기",
        after: "대화 회피로 오해를 살 수 있음",
        verdictMessage: "회피성 대화, 신뢰도 하락",
        triggers: ["거부","질문"]
    },
    {
        message: "\"귀찮아\"라는 말을 숨기지도 않네. 솔직함과는 거리가 먼 무례함.",
        before: "\"귀찮아\"라고 직접적으로 말함",
        after: "상대방에게 상처를 줄 수 있음",
        verdictMessage: "무례함, 관계 악화",
        triggers: ["거부"]
    },
    {
        message: "본인 자랑만 늘어놓는 건, 자기애 과잉 환자로밖에 안 보입니다.",
        before: "자신의 자랑만 함",
        after: "상대방이 피로감을 느낄 수 있음",
        verdictMessage: "자기 중심적인 대화, 관계 악화",
        triggers: ["혼자떠듦"]
    },
    {
        message: "밤늦게 연락해서 쓸데없는 얘기만 하는 건, 외로움 해소용으로밖에 안 느껴짐.",
        before: "밤늦게 의미 없는 대화 시도",
        after: "상대방에게 부담을 줄 수 있음",
        verdictMessage: "시간 낭비, 관계 발전 저해"
    },
    {
        message: "만나면 딴짓만 하고 폰만 보는 건, 데이트 폭력이나 다름없음.",
        before: "데이트 중 폰만 봄",
        after: "상대방에게 소외감을 줄 수 있음",
        verdictMessage: "무관심, 관계 악화"
    },
    {
        message: "\"내가 알아서 할게\"라는 말은, 당신 의견 따위는 필요 없다는 뜻.",
        before: "\"내가 알아서 할게\"라고 말함",
        after: "상대방의 의견을 무시하는 태도로 비춰짐",
        verdictMessage: "독단적인 태도, 관계 악화",
        triggers: ["거부"]
    },
    {
        message: "모든 대화가 명령조? 상전님 모시기도 아니고.",
        before: "명령조 말투 사용",
        after: "상대방이 불쾌감을 느낄 수 있음",
        verdictMessage: "갑질, 관계 악화"
    },
    {
        message: "상대방의 힘든 점에 공감 없이 해결책만 제시? 공감 능력 부족.",
        before: "해결책만 제시",
        after: "상대방이 위로받지 못한다고 느낄 수 있음",
        verdictMessage: "공감 부족, 관계 소홀"
    },
    {
        message: "대화 중간에 갑자기 할 말 없다고 끊는 건, 무례함의 극치.",
        before: "대화 중 갑자기 끊음",
        after: "상대방에게 상처를 줄 수 있음",
        verdictMessage: "무례함, 관계 단절"
    },
    {
        message: "애매하게 \"글쎄\"라고 답하는 건, 대화하기 싫다는 뜻으로밖에 안 들림.",
        before: "\"글쎄\"라고 답함",
        after: "대화 회피로 인식될 수 있음",
        verdictMessage: "회피성 답변, 관계 소홀",
        triggers: ["단답"]
    },
    {
        message: "자기 전에 습관처럼 연락하는 건, 그냥 의무감에서 하는 행동.",
        before: "자기 전 습관적인 연락",
        after: "진정성 없는 행동으로 느껴질 수 있음",
        verdictMessage: "의무적인 연락, 관계 발전 저해"
    },
    {
        message: "모든 대화의 결론이 \"그래서 뭐?\" 면, 당신은 공감 능력 제로.",
        before: "모든 대화의 결론이 \"그래서 뭐?\"",
        after: "상대방에게 무관심한 태도로 비춰짐",
        verdictMessage: "공감 부족, 관계 악화"
    },
    {
        message: "단답형 대답은 대화 종료 신호야. 눈치 챙기고 할 말 없으면 그냥 가만히 있어.",
        before: "상대방의 'ㅇㅇ', 'ㄴㄴ' 단답",
        after: "상대방의 대화 의지 없음",
        verdictMessage: "대화 지속 불가",
        triggers: ["단답"]
    },
    {
        message: "장문 카톡은 네 감정 쓰레기통 아니야. 간결하게 핵심만 말해. 누가 네 하소연 듣고 싶대?",
        before: "혼자 장문의 감정 호소",
        after: "상대방의 부담감 증가",
        verdictMessage: "자기 중심적",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "계속 질문만 던지면 짜증나. 대화는 탁구처럼 주고받는 거야. 혼자 랠리하지 마.",
        before: "연속적인 질문 공세",
        after: "상대방의 피로감 누적",
        verdictMessage: "일방적인 소통",
        triggers: ["질문","연속톡"]
    },
    {
        message: "읽씹은 명확한 거절이야. 쿨하게 인정하고 다른 사람 찾아봐.",
        before: "상대방의 읽씹 후 무응답",
        after: "상대방의 거부 의사 표현",
        verdictMessage: "관계 종료",
        triggers: ["읽씹"]
    },
    {
        message: "ㅋㅋㅋ 5개 이상은 과장된 반응이야. 진정성 없어 보이니까 적당히 해.",
        before: "과도한 ㅋㅋㅋ 남발",
        after: "상대방의 의심",
        verdictMessage: "진정성 부족",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘 도배는 유치해. 말로 표현 못하면 그냥 말을 하지 마.",
        before: "지나친 이모티콘 사용",
        after: "상대방의 짜증 유발",
        verdictMessage: "대화 수준 저하",
        triggers: ["이모지"]
    },
    {
        message: "답장 3시간 넘기는 건 대놓고 무시하는 거야. 연락할 가치가 없다고 생각하는 거지.",
        before: "3시간 이상의 늦은 답장",
        after: "상대방의 불쾌감",
        verdictMessage: "무시"
    },
    {
        message: "혼자 신나서 떠드는 건 관심병 환자 같아. 상대방 반응 좀 봐가면서 해.",
        before: "상대방 반응 없는 혼잣말",
        after: "상대방의 무관심",
        verdictMessage: "관심 갈구",
        triggers: ["혼자떠듦"]
    },
    {
        message: "'바빠서'는 핑계야. 진짜 중요한 사람이면 짬내서라도 연락해.",
        before: "바쁘다는 핑계",
        after: "상대방의 실망",
        verdictMessage: "거짓"
    },
    {
        message: "대화 흐름 끊는 뜬금없는 질문은 맥 빠지게 해. 분위기 파악 좀 해.",
        before: "맥락 없는 질문",
        after: "대화의 흥미 저하",
        verdictMessage: "분위기 파악 못함",
        triggers: ["질문"]
    },
    {
        message: "모든 대답에 '아' 하나 붙이는 건 성의 없어 보이는 거 알아? 대화할 의지가 없으면 그냥 말을 걸지 마.",
        before: "모든 대답에 '아'로 시작",
        after: "상대방의 무시당하는 느낌",
        verdictMessage: "성의 없음",
        triggers: ["단답"]
    },
    {
        message: "네 감정 기복에 맞춰주는 건 감정 쓰레기통 알바가 아니야. 혼자 해결해.",
        before: "잦은 감정 기복 표현",
        after: "상대방의 피로감 증가",
        verdictMessage: "감정 쓰레기통"
    },
    {
        message: "계속 과거 이야기만 꺼내면 발전이 없어. 현재를 살고 미래를 봐.",
        before: "과거에 얽매인 대화",
        after: "상대방의 답답함",
        verdictMessage: "정체"
    },
    {
        message: "비꼬는 말투는 매력 없어. 솔직하게 말해. 삐뚤어진 애정은 짜증만 유발해.",
        before: "빈정거리는 말투",
        after: "상대방의 반감",
        verdictMessage: "삐뚤어진 애정"
    },
    {
        message: "상대방 관심사 1도 모르는 티 내지 마. 최소한의 노력은 보여야지.",
        before: "상대방 관심사 무시",
        after: "상대방의 실망",
        verdictMessage: "무관심"
    },
    {
        message: "답정너 질문은 왜 하는 거야? 듣고 싶은 대답 정해놓고 묻는 거 꼴불견이야.",
        before: "답정너 질문",
        after: "상대방의 짜증",
        verdictMessage: "답정너",
        triggers: ["질문"]
    },
    {
        message: "맨날 똑같은 이야기 반복하는 거 지겨워. 새로운 주제 좀 가져와 봐.",
        before: "반복되는 대화 주제",
        after: "상대방의 지루함",
        verdictMessage: "지루함"
    },
    {
        message: "상대방 말 끊고 자기 말만 하는 건 무례한 행동이야. 경청 좀 해.",
        before: "상대방 말 끊기",
        after: "상대방의 불쾌감",
        verdictMessage: "무례함"
    },
    {
        message: "네 자랑만 늘어놓는 건 자기애 과시로밖에 안 보여. 겸손 좀 떨어.",
        before: "과도한 자기 자랑",
        after: "상대방의 질투/반감",
        verdictMessage: "자기애 과시"
    },
    {
        message: "부정적인 이야기만 쏟아내면 누가 좋아하겠어? 긍정적인 면도 좀 보여줘.",
        before: "지속적인 부정적 발언",
        after: "상대방의 피로감",
        verdictMessage: "부정적"
    },
    {
        message: "인터넷 밈 남발은 초딩 같아. 수준 떨어지니까 자제해.",
        before: "과도한 밈 사용",
        after: "상대방의 불쾌감",
        verdictMessage: "수준 낮음"
    },
    {
        message: "갑자기 뜬금없는 고백은 부담스러워. 충분한 관계 형성이 먼저야.",
        before: "갑작스러운 고백",
        after: "상대방의 부담감",
        verdictMessage: "부담"
    },
    {
        message: "계속해서 연락을 피하는 건 너에게 관심 없다는 명확한 신호야. 이제 그만해.",
        before: "지속적인 연락 회피",
        after: "상대방의 무관심",
        verdictMessage: "거절",
        triggers: ["거부"]
    },
    {
        message: "상대방의 힘든 이야기를 듣고 '힘내'라는 말밖에 못하는 건 공감 능력 부족이야. 더 깊이 있는 대화를 시도해 봐.",
        before: "상투적인 위로",
        after: "상대방의 공감 부족",
        verdictMessage: "공감 능력 부족"
    },
    {
        message: "너의 이상형만 계속 나열하는 건 의미 없어. 현실적인 상대를 찾아.",
        before: "비현실적인 이상형 제시",
        after: "상대방의 거리감",
        verdictMessage: "비현실적"
    },
    {
        message: "상대방의 질문에 되묻는 건 회피하는 것처럼 보여. 솔직하게 대답해.",
        before: "질문에 되묻기",
        after: "상대방의 의심",
        verdictMessage: "회피",
        triggers: ["질문"]
    },
    {
        message: "계속해서 같은 말을 반복하는 건 상대방을 무시하는 거야. 존중하는 태도를 보여줘.",
        before: "반복적인 말",
        after: "상대방의 무시당하는 느낌",
        verdictMessage: "무시"
    },
    {
        message: "네 모든 행동을 SNS에 올리는 건 관심병 환자 같아. 사생활을 지켜.",
        before: "과도한 SNS 활동",
        after: "상대방의 피로감",
        verdictMessage: "관종"
    },
    {
        message: "상대방의 과거 연애사를 캐묻는 건 무례한 행동이야. 현재에 집중해.",
        before: "과거 연애사 질문",
        after: "상대방의 불쾌감",
        verdictMessage: "무례함",
        triggers: ["질문"]
    },
    {
        message: "모든 대화를 '네, 아니오'로 끝내는 건 벽이랑 대화하는 것 같아. 대화 좀 이어나가 봐.",
        before: "단답형 대답 반복",
        after: "상대방의 답답함",
        verdictMessage: "벽",
        triggers: ["단답"]
    },
    {
        message: "계속해서 돈 자랑하는 건 천박해 보여. 인격적인 매력을 어필해 봐.",
        before: "돈 자랑",
        after: "상대방의 반감",
        verdictMessage: "천박함"
    },
    {
        message: "상대방의 외모만 칭찬하는 건 가벼워 보여. 내면의 아름다움을 발견해 봐.",
        before: "외모 칭찬만 함",
        after: "상대방의 불안함",
        verdictMessage: "가벼움"
    },
    {
        message: "모든 문제를 상대방 탓으로 돌리는 건 책임감 없는 행동이야. 자신을 돌아봐.",
        before: "상대방에게 책임 전가",
        after: "상대방의 분노",
        verdictMessage: "무책임"
    },
    {
        message: "상대방의 의견을 무시하고 자기 주장만 하는 건 독선적인 행동이야. 존중하는 태도를 보여줘.",
        before: "자기 주장만 함",
        after: "상대방의 무시당하는 느낌",
        verdictMessage: "독선적"
    },
    {
        message: "갑자기 연락 끊고 잠수 타는 건 최악이야. 최소한의 예의는 지켜.",
        before: "잠수",
        after: "상대방의 분노",
        verdictMessage: "최악"
    },
    {
        message: "상대방의 취미를 비웃는 건 무례한 행동이야. 존중하는 태도를 보여줘.",
        before: "취미 비웃음",
        after: "상대방의 불쾌감",
        verdictMessage: "무례함"
    },
    {
        message: "계속해서 과거 연애 이야기를 꺼내는 건 미련 있어 보이고 짜증나. 현재에 집중해.",
        before: "과거 연애 이야기 반복",
        after: "상대방의 불안감",
        verdictMessage: "미련"
    },
    {
        message: "상대방의 말을 제대로 듣지 않고 엉뚱한 대답하는 건 무시하는 거야. 집중 좀 해.",
        before: "엉뚱한 대답",
        after: "상대방의 무시당하는 느낌",
        verdictMessage: "무시"
    },
    {
        message: "모든 대화에 부정적인 답변만 하는 건 짜증 유발자야. 긍정적인 면을 좀 찾아봐.",
        before: "부정적인 답변 반복",
        after: "상대방의 피로감",
        verdictMessage: "짜증 유발"
    },
    {
        message: "상대방에게 모든 걸 맞춰달라는 건 이기적인 행동이야. 배려하는 마음을 가져.",
        before: "모든 것을 맞춰달라고 함",
        after: "상대방의 부담감",
        verdictMessage: "이기적"
    },
    {
        message: "계속해서 거짓말하는 건 신뢰를 무너뜨리는 행동이야. 솔직하게 대해.",
        before: "거짓말 반복",
        after: "상대방의 불신",
        verdictMessage: "불신"
    },
    {
        message: "상대방의 감정을 무시하고 자기 감정만 내세우는 건 이기적인 행동이야. 공감하는 태도를 보여줘.",
        before: "자기 감정만 내세움",
        after: "상대방의 무시당하는 느낌",
        verdictMessage: "이기적"
    },
    {
        message: "모든 대화를 명령조로 하는 건 불쾌감을 줘. 정중한 태도를 보여줘.",
        before: "명령조 말투",
        after: "상대방의 불쾌감",
        verdictMessage: "불쾌함"
    },
    {
        message: "상대방의 약점을 들춰내는 건 비열한 행동이야. 존중하는 태도를 보여줘.",
        before: "약점 들춰냄",
        after: "상대방의 상처",
        verdictMessage: "비열함"
    },
    {
        message: "계속해서 과거 잘못을 들춰내는 건 괴롭히는 거야. 용서했으면 잊어.",
        before: "과거 잘못 들춰냄",
        after: "상대방의 고통",
        verdictMessage: "괴롭힘"
    },
    {
        message: "상대방의 의견에 반박만 하는 건 싸우자는 거야? 건설적인 대화를 해.",
        before: "반박만 함",
        after: "상대방의 분노",
        verdictMessage: "싸움"
    },
    {
        message: "ㅋㅋㅋ 도배하고 이모티콘 섞는 건 초딩이냐? 진지하게 대화할 생각 없는 거지?",
        before: "ㅋㅋㅋ 과다 사용 + 이모티콘",
        after: "상대방의 짜증, 진지함 결여",
        verdictMessage: "초딩, 비진지",
        triggers: ["많은ㅋ","이모지"]
    },
    {
        message: "1분마다 카톡 보내는 건 스토커 같아. 숨 좀 쉬게 해줘.",
        before: "1분 간격 카톡",
        after: "상대방의 질림, 스토커 취급",
        verdictMessage: "스토커",
        triggers: ["연속톡"]
    },
    {
        message: "답장이 5시간? 너 priority 최하위야. 정신 차리고 매달리지 마.",
        before: "5시간 후 답장",
        after: "무관심",
        verdictMessage: "너는 뒷전",
        triggers: ["느린 답장"]
    },
    {
        message: "단답형 대답만 하는 거 안 보여? 벽 보고 얘기하는 거랑 뭐가 달라?",
        before: "단답형 대답",
        after: "귀찮음",
        verdictMessage: "대화 의지 없음",
        triggers: ["단답"]
    },
    {
        message: "계속 '네', '응'만 하네. 대화 끊고 싶다는 신호잖아. 눈치 좀 챙겨.",
        before: "'네', '응' 반복",
        after: "대화 종료 희망",
        verdictMessage: "강제 종료 임박",
        triggers: ["단답"]
    },
    {
        message: "ㅋㅋㅋ 도배? 너 어색해서 웃음으로 때우는 거 다 보여. 진솔함 제로.",
        before: "ㅋㅋㅋ 7개 이상",
        after: "불안함",
        verdictMessage: "불안감 증폭",
        triggers: ["많은ㅋ"]
    },
    {
        message: "이모티콘만 날리는 거 유치해. 대화 수준 좀 높여봐.",
        before: "이모티콘 남발",
        after: "회피",
        verdictMessage: "대화 거부",
        triggers: ["이모지"]
    },
    {
        message: "혼자 장문 톡 보내고 자폭하네. 상대는 질려할 뿐이야.",
        before: "혼자 장문 톡",
        after: "부담감",
        verdictMessage: "역효과 발생",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "상대가 '바빠'라고 하면 진짜 바쁜 거야. 연락 기다리지 마.",
        before: "'바빠'라는 답변",
        after: "거절 의사",
        verdictMessage: "희망 없음",
        triggers: ["거부"]
    },
    {
        message: "읽씹? 너는 그냥 '읽을 가치'도 없는 존재인 거야.",
        before: "읽씹",
        after: "무시",
        verdictMessage: "존재감 삭제",
        triggers: ["읽씹"]
    },
    {
        message: "연속톡 보내는 거 스토커 같아. 좀 떨어져.",
        before: "3회 이상 연속톡",
        after: "불쾌감",
        verdictMessage: "스토커 경고",
        triggers: ["연속톡"]
    },
    {
        message: "질문만 계속 던지는 거 면접 보는 것 같잖아. 재미없어.",
        before: "질문만 반복",
        after: "지루함",
        verdictMessage: "매력 감소",
        triggers: ["질문"]
    },
    {
        message: "상대가 너한테 궁금한 게 하나도 없네. 대화 주제 바꿔보던가, 포기하던가.",
        before: "상대방의 질문 없음",
        after: "무관심",
        verdictMessage: "관심 부족"
    },
    {
        message: "맨날 똑같은 얘기만 하니까 질리지. 새로운 모습을 보여줘.",
        before: "반복적인 대화",
        after: "지루함",
        verdictMessage: "매력 상실"
    },
    {
        message: "상대방이 너 연락 피하는 거 안 보여? 이제 그만해.",
        before: "연락 회피",
        after: "회피",
        verdictMessage: "관계 단절 임박",
        triggers: ["읽씹","느린 답장","단답"]
    },
    {
        message: "'아...' 한 글자 답장은 '꺼져'랑 똑같은 의미야.",
        before: "'아...' 답변",
        after: "무시",
        verdictMessage: "강력한 거부",
        triggers: ["단답"]
    },
    {
        message: "상대방은 이미 선 그었는데, 혼자 불타오르네. 안쓰럽다.",
        before: "상대방의 선긋기",
        after: "절망",
        verdictMessage: "착각 금지",
        triggers: ["단답","느린 답장"]
    },
    {
        message: "네 감정 쓰레기통 아니니까, 푸념만 늘어놓지 마.",
        before: "푸념만 늘어놓음",
        after: "피로감",
        verdictMessage: "불쾌감 유발",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "답장 텀이 점점 길어지네. 조만간 차단당할 듯.",
        before: "답장 텀 증가",
        after: "귀찮음",
        verdictMessage: "차단 위험",
        triggers: ["느린 답장"]
    },
    {
        message: "너만 신났네. 상대방은 하나도 안 궁금해하는 것 같아.",
        before: "혼자 신나서 떠듦",
        after: "무관심",
        verdictMessage: "공감 능력 부족",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대방이 할 말 없게 만드는 재주 있네. 대화 좀 이끌어봐.",
        before: "대화 단절 유도",
        after: "무관심",
        verdictMessage: "노잼 판정",
        triggers: ["단답"]
    },
    {
        message: "너, 지금 호구 잡히고 있는 거야. 정신 차려.",
        before: "일방적인 관계",
        after: "착취",
        verdictMessage: "호구 인증"
    },
    {
        message: "뜬금없이 자기 자랑하는 거 매력 없어. 겸손해져.",
        before: "자기 자랑",
        after: "반감",
        verdictMessage: "허세 작렬"
    },
    {
        message: "착한 척 하는 거 역겨워. 솔직해져.",
        before: "과도한 친절",
        after: "불신",
        verdictMessage: "가식적임"
    },
    {
        message: "상대가 뭘 좋아하는지 파악도 못하고 들이대니 차이지.",
        before: "취향 파악 실패",
        after: "무관심",
        verdictMessage: "준비 부족"
    },
    {
        message: "피곤하다는 말 앵무새처럼 반복하네. 짜증나.",
        before: "피곤하다는 말 반복",
        after: "짜증",
        verdictMessage: "매력 감소"
    },
    {
        message: "사진 보내달라고 조르는 거 변태 같아. 자제해.",
        before: "사진 요구",
        after: "불쾌감",
        verdictMessage: "성희롱 경고",
        triggers: ["질문"]
    },
    {
        message: "술 마시자는 핑계 이제 안 통해. 다른 핑계를 생각해.",
        before: "술 약속 제안",
        after: "거절",
        verdictMessage: "진부함"
    },
    {
        message: "돈 자랑하는 거 없어 보여. 가만히 있어.",
        before: "재력 과시",
        after: "반감",
        verdictMessage: "천박함"
    },
    {
        message: "맨날 늦게 답장하면서 변명만 늘어놓네. 그냥 싫다고 말해.",
        before: "늦은 답장 후 변명",
        after: "불신",
        verdictMessage: "거짓말",
        triggers: ["느린 답장"]
    },
    {
        message: "상대방 말투 따라하는 거 소름 끼쳐. 개성 좀 찾아.",
        before: "말투 따라하기",
        after: "불쾌감",
        verdictMessage: "기괴함"
    },
    {
        message: "과거 연애 얘기 꺼내는 거 최악이야. 입 다물어.",
        before: "과거 연애 언급",
        after: "불쾌감",
        verdictMessage: "자폭"
    },
    {
        message: "상대방 비꼬는 말투 쓰는 거 수준 낮아 보여.",
        before: "비꼬는 말투",
        after: "반감",
        verdictMessage: "인성 의심"
    },
    {
        message: "애매하게 썸 타는 척 하지 마. 질척거려.",
        before: "애매한 태도",
        after: "답답함",
        verdictMessage: "어장관리"
    },
    {
        message: "상대방한테 맞춰주기만 하는 거 매력 없어. 주관을 가져.",
        before: "무조건적인 동의",
        after: "무매력",
        verdictMessage: "존재감 없음"
    },
    {
        message: "맨날 똑같은 시간에 연락하는 거 패턴 읽혔어. 예측 불가능하게 행동해.",
        before: "반복적인 연락 시간",
        after: "지루함",
        verdictMessage: "지루함 유발"
    },
    {
        message: "상대방 칭찬만 하는 거 아첨꾼 같아. 진심을 담아.",
        before: "과도한 칭찬",
        after: "불신",
        verdictMessage: "가식적임"
    },
    {
        message: "상대방 뒷담화 하는 거 너 이미지 깎아먹는 짓이야.",
        before: "뒷담화",
        after: "불쾌감",
        verdictMessage: "인성 바닥"
    },
    {
        message: "허세 부리는 말투 쓰는 거 없어 보여. 있는 척 하지 마.",
        before: "허세 말투",
        after: "비웃음",
        verdictMessage: "허당 인증"
    },
    {
        message: "상대방한테 의존하는 거 보기 흉해. 독립적으로 살아.",
        before: "의존적인 태도",
        after: "부담감",
        verdictMessage: "기생충"
    },
    {
        message: "싸구려 멘트 날리는 거 유치해. 진심을 보여줘.",
        before: "작업 멘트",
        after: "불쾌감",
        verdictMessage: "저렴함"
    },
    {
        message: "상대방 과거 들추는 거 최악의 행동이야. 입 닫아.",
        before: "과거 들추기",
        after: "분노",
        verdictMessage: "돌이킬 수 없음"
    },
    {
        message: "상대방 감정 무시하는 거 공감 능력 제로 인증이야.",
        before: "공감 능력 부재",
        after: "실망",
        verdictMessage: "싸이코패스"
    },
    {
        message: "자기 연민에 빠져서 징징거리지 마. 매력 없어.",
        before: "자기 연민",
        after: "짜증",
        verdictMessage: "한심함",
        triggers: ["장문"]
    },
    {
        message: "상대방한테 모든 걸 다 주려고 하지 마. 너만 손해 봐.",
        before: "헌신적인 태도",
        after: "이용",
        verdictMessage: "바보 인증"
    },
    {
        message: "말끝마다 '그랬구나' 붙이는 거 로봇 같아. 영혼을 담아.",
        before: "'그랬구나' 반복",
        after: "지루함",
        verdictMessage: "영혼 없음",
        triggers: ["단답"]
    },
    {
        message: "상대방한테 화내는 거 너만 손해야. 감정 조절 좀 해.",
        before: "분노 표출",
        after: "후회",
        verdictMessage: "자멸"
    },
    {
        message: "답장 강요하는 거 스토커 같아. 가만히 있어.",
        before: "답장 재촉",
        after: "불쾌감",
        verdictMessage: "스토커",
        triggers: ["연속톡"]
    },
    {
        message: "상대방 무시하는 말투 쓰는 거 재수 없어. 겸손해져.",
        before: "무시하는 말투",
        after: "분노",
        verdictMessage: "인성 쓰레기"
    },
    {
        message: "혼자 북 치고 장구 치고 다 하네. 상대방 숨 쉴 틈 좀 줘.",
        before: "독점적인 대화",
        after: "질식",
        verdictMessage: "숨 막힘",
        triggers: ["혼자떠듦","장문","연속톡"]
    },
    {
        message: "상대방한테 질투심 유발하려는 거 뻔해. 역효과나.",
        before: "질투심 유발 시도",
        after: "비웃음",
        verdictMessage: "역효과"
    },
    {
        message: "답장이 5시간이나 걸리는 건 핑계. 우선순위에서 밀렸다는 명확한 증거.",
        before: "5시간 뒤 단답형 답장",
        after: "무관심",
        verdictMessage: "시간 관리가 안 되는 게 아니라, 당신에게 쓸 시간이 없는 것.",
        triggers: ["단답","읽씹"]
    },
    {
        message: "장문 보내놓고 답장 없다고 징징대지 마. 상대방은 네 감정 쓰레기통이 아니야.",
        before: "혼자 장문 메시지",
        after: "답답함",
        verdictMessage: "상대방의 반응을 고려하지 않은 일방적인 소통은 폭력.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "질문만 쏟아내지 마. 취조 당하는 기분 들게 하지 말고.",
        before: "연속적인 질문 공세",
        after: "불쾌함",
        verdictMessage: "대화는 핑퐁 게임이지, 심문이 아님.",
        triggers: ["질문","연속톡"]
    },
    {
        message: "이모티콘으로 대화 때우려는 수작 부리지 마. 진심이 느껴지지 않아.",
        before: "과도한 이모티콘 사용",
        after: "가벼움",
        verdictMessage: "감정 표현에 서툴면 노력이라도 해. 이모티콘은 회피 수단일 뿐.",
        triggers: ["이모지"]
    },
    {
        message: "ㅋㅋㅋ 5개 이상은 비웃음으로 간주될 수 있음. 과도한 ㅋ 사용은 불안함의 표출.",
        before: "ㅋㅋㅋ 남발",
        after: "불안",
        verdictMessage: "자신감 부족을 ㅋ으로 감추려 하지 마.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 '바빠'라고 하면 진짜 바쁜 거다. 딴 놈 만나러 간다고 생각하는 게 정신 건강에 이로움.",
        before: "'바빠'라는 답변",
        after: "합리화",
        verdictMessage: "거절을 돌려 말하는 방식. 미련 버려.",
        triggers: ["거부"]
    },
    {
        message: "네 혼잣말에 상대방은 리액션 봇이 아님. 대화 참여를 유도해야지.",
        before: "상대방 반응 없는 혼잣말",
        after: "지루함",
        verdictMessage: "일방적인 정보 전달은 대화가 아니라 강의.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "답장 텀이 점점 길어지는 건 관심 소멸의 신호. 현실을 직시해.",
        before: "답장 시간 증가",
        after: "무관심",
        verdictMessage: "관계의 유통기한이 임박했음을 인지해야 함.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 읽씹 후 프사 바꾸는 건 대놓고 무시하는 행위. 정신승리 하지 마.",
        before: "읽씹 후 프사 변경",
        after: "분노",
        verdictMessage: "존중받지 못하고 있다는 명백한 증거.",
        triggers: ["읽씹"]
    },
    {
        message: "회피형 인간 붙잡고 질질 짜지 마. 어차피 변하지 않아.",
        before: "회피성 발언",
        after: "절망",
        verdictMessage: "감정 소모만 클 뿐. 에너지 낭비하지 마.",
        triggers: ["거부"]
    },
    {
        message: "매번 네 이야기만 하는 건 이기적인 행동. 상대방도 주인공이 되고 싶어해.",
        before: "자기 이야기만 함",
        after: "피로감",
        verdictMessage: "대화는 공평해야 지속 가능함.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "'아...' 한 글자는 대화 종료 선언. 눈치 있으면 알아서 꺼져.",
        before: "'아...' 답변",
        after: "귀찮음",
        verdictMessage: "더 이상 할 말이 없다는 무언의 압박.",
        triggers: ["단답"]
    },
    {
        message: "선톡 없이는 이어지지 않는 관계는 이미 끝난 거나 마찬가지.",
        before: "항상 자신이 먼저 연락",
        after: "허무함",
        verdictMessage: "일방적인 노력은 오래가지 못함.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'만 반복하면 대화하기 싫다는 뜻. 앵무새랑 대화하는 기분.",
        before: "ㅋㅋㅋ 반복",
        after: "지루함",
        verdictMessage: "성의 없는 반응은 관계 단절의 신호.",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "애매한 답장은 여지 남기는 게 아니라, 책임 회피하는 것.",
        before: "애매모호한 답변",
        after: "불안함",
        verdictMessage: "확실한 거절이 오히려 나을 수 있음.",
        triggers: ["거부"]
    },
    {
        message: "상대가 단답으로 대답하면, 너도 똑같이 단답으로 응수해. 미련 버리게.",
        before: "상대의 단답",
        after: "실망",
        verdictMessage: "받는 만큼 돌려줘야 관계가 공평해짐.",
        triggers: ["단답"]
    },
    {
        message: "네 감정 쓰레기통 역할을 강요하지 마. 정신과 상담을 받던가.",
        before: "계속되는 푸념",
        after: "피로",
        verdictMessage: "건강하지 못한 관계는 서로를 망침.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 '나중에'라고 말하면 절대 안 옴. 기대하지 마.",
        before: "'나중에' 약속",
        after: "기대감",
        verdictMessage: "미래는 현재의 연장선상에 없음.",
        triggers: ["거부"]
    },
    {
        message: "상대가 답장을 늦게 하면서 스토리는 꼬박꼬박 챙겨보는 건 너 따위 안중에도 없다는 뜻.",
        before: "늦은 답장, 스토리 염탐",
        after: "무시",
        verdictMessage: "관심 없음 + 시간 낭비 금지.",
        triggers: ["읽씹"]
    },
    {
        message: "같은 질문 반복하지 마. 상대방 기억력 테스트하는 것도 아니고.",
        before: "같은 질문 반복",
        after: "짜증",
        verdictMessage: "대화의 흐름을 끊는 최악의 행동.",
        triggers: ["질문"]
    },
    {
        message: "상대가 읽씹 후 딴소리하면, 너는 그냥 대화 상대로도 생각 안 하는 거임.",
        before: "읽씹 후 딴소리",
        after: "굴욕",
        verdictMessage: "존중받지 못한다는 명백한 증거.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 '잘자'라고 보내면, 더 이상 할 말 없다는 뜻. 미련 버리고 잠이나 자.",
        before: "'잘자'로 대화 마무리",
        after: "허무함",
        verdictMessage: "관계 발전 가능성 제로.",
        triggers: ["단답"]
    },
    {
        message: "상대가 '넹' 이라고 답하면, 대화하기 귀찮다는 뜻. 더 이상 추근대지 마.",
        before: "'넹' 답변",
        after: "무시",
        verdictMessage: "성의 없는 답변은 관계 단절의 신호.",
        triggers: ["단답"]
    },
    {
        message: "상대가 '오' 라고 답하면, 할말이 없다는 뜻. 다른 화제를 찾던가, 포기하던가.",
        before: "'오' 답변",
        after: "무시",
        verdictMessage: "대화 이어갈 의지 없음.",
        triggers: ["단답"]
    },
    {
        message: "자꾸 과거 이야기 꺼내지 마. 현재에 집중해.",
        before: "과거 이야기 반복",
        after: "지침",
        verdictMessage: "과거에 갇혀 살지 마.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 '음' 이라고 답하면, 할말이 없거나 귀찮다는 뜻. 말을 걸지마.",
        before: "'음' 답변",
        after: "귀찮음",
        verdictMessage: "단절의 신호.",
        triggers: ["단답"]
    },
    {
        message: "상대가 답장 안 하면, 카톡 말고 현실에서 뭘 잘못했는지 생각해봐.",
        before: "읽씹 지속",
        after: "불안함",
        verdictMessage: "원인을 분석하고 해결해야 관계 개선 가능.",
        triggers: ["읽씹"]
    },
    {
        message: "밤늦게 술 마시고 연락하지 마. 후회할 짓 하지 말고.",
        before: "술 취한 후 연락",
        after: "후회",
        verdictMessage: "이성적인 판단이 불가능할 때는 연락 금지.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너의 연락을 기다릴 거라고 착각하지 마. 현실은 드라마가 아니야.",
        before: "혼자만의 기대",
        after: "착각",
        verdictMessage: "객관적으로 상황을 판단해야 함.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 '넹' '넴' '넹넹' 거리는건 그냥 귀찮은거야. 눈치껏 꺼져",
        before: "성의없는 답변",
        after: "짜증",
        verdictMessage: "더이상 연락하지마",
        triggers: ["단답"]
    },
    {
        message: "이모티콘만 보내는건 대화하기 싫다는 뜻이야. 상대방의 시간을 존중해.",
        before: "이모티콘 도배",
        after: "무시",
        verdictMessage: "더이상 연락하지마",
        triggers: ["이모지"]
    },
    {
        message: "스스로 답정너 스타일인거 알면 고쳐. 주변사람 다 떠나간다.",
        before: "결론 정해놓고 물어봄",
        after: "짜증",
        verdictMessage: "본인만 모름",
        triggers: ["질문"]
    },
    {
        message: "ㅋㅋㅋ 도배하는건 초딩이나 하는 짓이다. 대화 수준을 높여라.",
        before: "ㅋㅋㅋ 도배",
        after: "비웃음",
        verdictMessage: "저급한 대화",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대방이 질문에 답을 안하면 너에게 관심이 없는거야. 자존심을 지켜.",
        before: "질문 무시",
        after: "무관심",
        verdictMessage: "더이상 연락하지마",
        triggers: ["질문","읽씹"]
    },
    {
        message: "상대가 할말 없으면 'ㅇㅇ' '넹' 거리는거야. 제발 눈치챙겨.",
        before: "성의없는 답변",
        after: "무시",
        verdictMessage: "더이상 연락하지마",
        triggers: ["단답"]
    },
    {
        message: "상대가 읽씹하고 다른사람이랑 노는거 보면 현타 안오냐? 객관적으로 봐라.",
        before: "읽씹 후 다른 활동",
        after: "무시",
        verdictMessage: "관계를 정리해라",
        triggers: ["읽씹"]
    },
    {
        message: "상대방이 대화 주제를 계속 바꾸면 너랑 대화하기 싫은거다. 눈치 있으면 알아서 꺼져.",
        before: "대화 주제 회피",
        after: "불쾌함",
        verdictMessage: "관계를 정리해라",
        triggers: ["거부"]
    }
];

// NEGATIVE_STRONG: 0~14점 (200개 목표, 현재 20개)
const NEGATIVE_STRONG = [
    {
        message: "3일 동안 답장 없으면 그냥 번호 지워. 폰 고장난 척 연기하는 수준.",
        before: "3일 동안 답장 없음",
        after: "상대방의 무관심",
        verdictMessage: "가망 없음. 시간 낭비.",
        triggers: ["읽씹"]
    },
    {
        message: "계속 'ㅋㅋㅋ'만 쳐 보내는 거 보니까 너랑 진지하게 대화할 생각 없어. 그냥 웃어넘기려는 거지.",
        before: "대화에 'ㅋㅋㅋ' 과다 사용",
        after: "대화 회피 심리",
        verdictMessage: "대화 거부. 더 이상 노력 X.",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "매번 네가 먼저 연락하는 패턴? 걔는 그냥 네 연락 기다리는 수동적인 사람일 뿐이야.",
        before: "항상 내가 먼저 연락",
        after: "상대의 의존적인 태도",
        verdictMessage: "주도권 없음. 관계 개선 불가.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "네 장문 카톡에 단답으로 답장하는 건 '귀찮으니까 알아서 끊어'라는 뜻이야. 눈치 챙겨.",
        before: "장문 카톡에 단답",
        after: "귀찮음, 대화 종료 유도",
        verdictMessage: "관심 없음. 대화 시도 중단.",
        triggers: ["장문","단답"]
    },
    {
        message: "질문만 하고 자기는 질문 안 하는 거? 너에 대한 궁금증 자체가 없는 거야.",
        before: "나는 질문, 상대방은 X",
        after: "너에 대한 무관심",
        verdictMessage: "일방적인 관계. 정리 요망.",
        triggers: ["질문"]
    },
    {
        message: "만나자는 말에 '나중에'만 반복하는 건 절대 만나고 싶지 않다는 완곡한 거절이야.",
        before: "만남 제안에 '나중에'만 반복",
        after: "만남 회피, 거절 의사",
        verdictMessage: "거절. 더 이상 제안 X.",
        triggers: ["거부"]
    },
    {
        message: "이모티콘만 덩그러니 보내는 건 대화하기 싫다는 무언의 압박이야. 눈치껏 끝내.",
        before: "단독 이모티콘 답장",
        after: "대화 종료 의사",
        verdictMessage: "대화 거부. 종료.",
        triggers: ["이모지","단답"]
    },
    {
        message: "네 카톡에 1시간 뒤에 답장 오는 건 네가 후순위라는 증거야. 잊혀질 때쯤 답장하는 거지.",
        before: "1시간 뒤 답장",
        after: "낮은 우선순위",
        verdictMessage: "후순위. 기대 X.",
        triggers: ["읽씹"]
    },
    {
        message: "네가 10줄 보내면 걔는 2줄? 너 혼자 드라마 찍고 있는 거야. 현실을 직시해.",
        before: "나는 장문, 상대는 단문",
        after: "대화 불균형",
        verdictMessage: "혼자만의 관계. 포기.",
        triggers: ["장문","단답"]
    },
    {
        message: "읽고 답장 안 하는 게 일상이라면 너는 그냥 '카톡 친구'일 뿐이야. 더 이상의 의미 부여는 금물.",
        before: "일상적인 읽씹",
        after: "단순한 카톡 친구",
        verdictMessage: "친구. 발전 가능성 X.",
        triggers: ["읽씹"]
    },
    {
        message: "매번 네가 먼저 안부 묻는 건 걔는 너에게 궁금한 게 하나도 없다는 뜻이야.",
        before: "항상 먼저 안부",
        after: "상대의 무관심",
        verdictMessage: "관심 없음. 연락 중단.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "'응', '아니' 단답만 하는 건 너랑 대화하기 싫다는 명확한 신호야. 제발 알아들어.",
        before: "'응', '아니' 단답",
        after: "대화 거부 의사",
        verdictMessage: "대화 거부. 포기.",
        triggers: ["단답"]
    },
    {
        message: "선톡하면 30분 내 답장, 아니면 감감무소식? 네 존재 자체가 필요할 때만 생각나는 사람이야.",
        before: "선톡 시 빠른 답장, 아니면 늦음",
        after: "필요할 때만 찾는 관계",
        verdictMessage: "필요에 의한 관계. 정리.",
        triggers: ["읽씹"]
    },
    {
        message: "네 TMI에 '오…' 한 마디? 너의 이야기에 전혀 관심 없다는 뜻이야. 혼잣말은 일기장에.",
        before: "나의 TMI에 '오…'",
        after: "무관심, 공감 부족",
        verdictMessage: "공감 능력 부족. 대화 중단.",
        triggers: ["장문","단답"]
    },
    {
        message: "만나자고 하면 핑계만 대는 건 너와의 약속에 대한 가치를 전혀 느끼지 못한다는 거야.",
        before: "만남 회피, 핑계",
        after: "낮은 가치 부여",
        verdictMessage: "가치 없음. 포기.",
        triggers: ["거부"]
    },
    {
        message: "네 질문에 엉뚱한 대답? 너랑 제대로 된 소통을 할 생각이 없는 거야.",
        before: "엉뚱한 대답",
        after: "소통 거부",
        verdictMessage: "소통 불가. 포기.",
        triggers: ["질문","단답"]
    },
    {
        message: "읽씹 후 '바빴어'는 뻔한 거짓말. 폰은 항상 손에 있다는 걸 너도 알잖아.",
        before: "읽씹 후 '바빴어'",
        after: "거짓말, 변명",
        verdictMessage: "거짓말. 신뢰 X.",
        triggers: ["읽씹"]
    },
    {
        message: "네 감정적인 장문에 '힘내!' 한마디? 공감 능력 제로. 벽이랑 대화하는 게 나을 듯.",
        before: "감정적인 장문에 '힘내!'",
        after: "공감 능력 부족",
        verdictMessage: "공감 능력 제로. 포기.",
        triggers: ["장문","단답"]
    },
    {
        message: "네가 무슨 말만 하면 'ㅋㅋㅋ'로 얼버무리는 건 너를 무시하는 거야. 존중받지 못하는 관계는 끝내.",
        before: "대화 내용 무관 'ㅋㅋㅋ' 남발",
        after: "무시, 대화 회피",
        verdictMessage: "무시. 포기.",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "계속 회피하는 대화 주제가 있다면 너에게 솔직해질 마음이 없다는 거야.",
        before: "특정 주제 회피",
        after: "솔직함 결여",
        verdictMessage: "불신. 포기.",
        triggers: ["거부"]
    },
    {
        message: "새벽 2시에 답장 오는 건 심심풀이 or 술김. 진지한 관계는 절대 아님.",
        before: "새벽 2시 답장",
        after: "심심풀이, 술김",
        verdictMessage: "진지한 관계 X. 정리.",
        triggers: ["읽씹"]
    },
    {
        message: "네가 먼저 연락 안 하면 연락 절대 안 오는 거? 너는 그냥 옵션이야.",
        before: "내가 먼저 연락 안 하면 연락 X",
        after: "옵션 취급",
        verdictMessage: "옵션. 정리.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "답장은 꼬박꼬박 하는데, 대화가 이어지질 않아? 너와의 '연결'을 원하지 않는 거야.",
        before: "답장은 오는데 대화 단절",
        after: "관계 발전 의지 X",
        verdictMessage: "발전 가능성 X. 포기.",
        triggers: ["단답"]
    },
    {
        message: "프로필 사진은 계속 바뀌는데, 네 카톡에는 답장이 없어? 너보다 SNS가 더 중요한 사람이야.",
        before: "프로필 사진은 활발, 카톡은 무응답",
        after: "SNS > 너",
        verdictMessage: "SNS 중독. 포기.",
        triggers: ["읽씹"]
    },
    {
        message: "계속 '바빠'라는 핑계만 대는 건 너에게 시간 투자할 가치를 못 느낀다는 거야. ",
        before: "잦은 '바빠' 핑계",
        after: "낮은 가치 부여",
        verdictMessage: "가치 없음. 포기.",
        triggers: ["거부"]
    },
    {
        message: "네 모든 질문에 '글쎄'라고 답하는 건 대화 의지 자체가 없는 거야. 질문 금지.",
        before: "모든 질문에 '글쎄'",
        after: "대화 의지 X",
        verdictMessage: "대화 불가. 포기.",
        triggers: ["질문","단답"]
    },
    {
        message: "읽씹 후 3일 뒤에 '미안!' 한 마디? 그냥 형식적인 사과일 뿐이야. 반복되면 버려.",
        before: "3일 뒤 '미안!'",
        after: "형식적인 사과",
        verdictMessage: "형식적인 관계. 포기.",
        triggers: ["읽씹"]
    },
    {
        message: "네 자랑에 '대단하다' 한 마디? 질투 or 무관심. 둘 다 최악.",
        before: "자랑에 '대단하다'",
        after: "질투 or 무관심",
        verdictMessage: "최악. 포기.",
        triggers: ["단답"]
    },
    {
        message: "네가 먼저 연락 안 하면 절대 연락 안 하는 건 너를 잊고 산다는 뜻이야. ",
        before: "내가 먼저 연락 안 하면 연락 X",
        after: "너를 잊고 삶",
        verdictMessage: "잊혀짐. 포기.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "카톡 배경은 커플 사진인데, 너랑은 연락 뜸? 너는 그냥 '보험'일 뿐이야.",
        before: "카톡 배경 커플 사진, 너와 연락 뜸",
        after: "보험 관계",
        verdictMessage: "보험. 정리.",
        triggers: ["읽씹"]
    },
    {
        message: "네 슬픈 이야기에 이모티콘 하나? 공감 능력 결여. 사이코패스인가 의심해봐.",
        before: "슬픈 이야기에 이모티콘",
        after: "공감 능력 결여",
        verdictMessage: "공감 능력 부족. 포기.",
        triggers: ["장문","이모지"]
    },
    {
        message: "네 연락에 답장은 꼬박꼬박 오지만, 약속은 절대 안 잡아? 너는 그냥 '카톡 친구' 이상도 이하도 아냐.",
        before: "답장은 꼬박꼬박, 약속은 X",
        after: "카톡 친구",
        verdictMessage: "친구. 발전 가능성 X.",
        triggers: ["단답","거부"]
    },
    {
        message: "네 취미 물어보지도 않는 건 너에게 진심으로 관심 없다는 증거야. 포기해.",
        before: "취미 질문 X",
        after: "무관심",
        verdictMessage: "관심 없음. 포기.",
        triggers: ["질문"]
    },
    {
        message: "네 장문에 5분 만에 답장 오는 건 복사 붙여넣기 or 챗봇. 진심이 아니야.",
        before: "장문에 5분 내 답장",
        after: "성의 없는 답장",
        verdictMessage: "성의 없음. 포기.",
        triggers: ["장문","단답"]
    },
    {
        message: "매번 네가 대화 시작하면 5분 안에 나가버리는 건 너랑 대화하기 싫다는 명확한 신호야.",
        before: "대화 시작 후 5분 내 퇴장",
        after: "대화 거부",
        verdictMessage: "대화 거부. 포기.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "네 모든 질문에 '비밀'이라고 답하는 건 너에게 마음을 열 생각이 없다는 거야. 닫힌 마음은 열 수 없어.",
        before: "모든 질문에 '비밀'",
        after: "마음의 문 닫음",
        verdictMessage: "소통 불가. 포기.",
        triggers: ["질문","단답"]
    },
    {
        message: "읽씹 후 '배터리 없었어'는 21세기형 뻥카. 제발 그만 속아.",
        before: "읽씹 후 '배터리 없었어'",
        after: "거짓말, 변명",
        verdictMessage: "거짓말. 신뢰 X.",
        triggers: ["읽씹"]
    },
    {
        message: "네 칭찬에 '너도' 한마디? 앵무새 수준. 진심 없는 칭찬은 의미 없어.",
        before: "칭찬에 '너도'",
        after: "진심 없는 칭찬",
        verdictMessage: "진심 없음. 포기.",
        triggers: ["단답"]
    },
    {
        message: "매번 네가 연락 시작하면 1시간 뒤에 읽는 건 너를 '생각날 때만' 보는 존재로 취급한다는 거야. 쓰레기통 아님.",
        before: "내가 연락 시작하면 1시간 뒤 읽음",
        after: "낮은 우선순위",
        verdictMessage: "쓰레기통 취급. 정리.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "네 중요한 이야기에 이모티콘 도배? 너를 진지하게 생각하지 않는다는 증거야.",
        before: "중요한 이야기에 이모티콘 도배",
        after: "진지함 결여",
        verdictMessage: "진지함 없음. 포기.",
        triggers: ["장문","이모지"]
    },
    {
        message: "네 연락에 답장은 꼬박꼬박 오지만, 3일 이상 연락이 끊기면 너는 그냥 '아는 사람'일 뿐이야.",
        before: "답장은 꼬박꼬박, 3일 이상 연락 두절",
        after: "아는 사람",
        verdictMessage: "아는 사람. 발전 가능성 X.",
        triggers: ["단답"]
    },
    {
        message: "네 꿈 물어보지도 않는 건 너의 미래에 관심 없다는 뜻이야. 같이 걸어갈 생각 없어.",
        before: "꿈 질문 X",
        after: "미래에 대한 무관심",
        verdictMessage: "미래 없음. 포기.",
        triggers: ["질문"]
    },
    {
        message: "네 모든 카톡에 1분 안에 'ㅇㅇ'만 찍는 건 그냥 대화 자체를 귀찮아하는 거야. 로봇이랑 대화하는 기분.",
        before: "모든 카톡에 1분 내 'ㅇㅇ'",
        after: "대화 귀찮음",
        verdictMessage: "대화 거부. 포기.",
        triggers: ["단답"]
    },
    {
        message: "매번 네가 먼저 연락하고, 걔는 답장만 하는 건 너 혼자 북 치고 장구 치는 꼴이야. 그만 둬.",
        before: "내가 먼저 연락, 상대는 답장만",
        after: "혼자만의 노력",
        verdictMessage: "일방적인 관계. 포기.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "네 모든 질문에 '모르겠어'라고 답하는 건 너와 더 이상 알아가고 싶지 않다는 뜻이야.",
        before: "모든 질문에 '모르겠어'",
        after: "관계 발전 의지 X",
        verdictMessage: "관계 발전 불가. 포기.",
        triggers: ["질문","단답"]
    },
    {
        message: "네가 보낸 캡쳐에 'ㅋㅋㅋ'만 보내는건 걍 쌩까는거임. 무시 당하는거 즐기는거 아니면 톡 그만 보내셈.",
        before: "내가 캡쳐보냈는데 ㅋㅋㅋ만 보냄",
        after: "무시",
        verdictMessage: "대화 거부. 포기.",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "답장이 3시간 넘게 걸리는 건 핑계일 뿐. 너한테 투자할 시간이 아깝다는 명확한 신호야.",
        before: "느린 답장",
        after: "무관심",
        verdictMessage: "시간 낭비하지 마.",
        triggers: ["느린 답장"]
    },
    {
        message: "대화가 이어지지 않고 자꾸 끊기는 건, 상대방이 너와의 대화에 흥미를 못 느낀다는 증거야. 벽 보고 얘기하는 거랑 뭐가 달라?",
        before: "끊기는 대화",
        after: "무관심",
        verdictMessage: "혼자 북 치고 장구 치지 마.",
        triggers: ["단답"]
    },
    {
        message: "네 감정 쓰레기통이 아니야. 힘든 얘기만 쏟아내고 상대방 반응은 살피지도 않는 건 이기적인 행동이야.",
        before: "힘든 얘기만 함",
        after: "감정 쓰레기통 취급",
        verdictMessage: "관계가 일방적이면 결국 깨져.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "카톡 답장 내용이 매번 '응', '넹', '알았어' 3글자 이내면, 너와의 대화를 억지로 참고 있다는 뜻이야.",
        before: "3글자 이내 단답",
        after: "억지로 참음",
        verdictMessage: "더 이상 기대하지 마.",
        triggers: ["단답"]
    },
    {
        message: "선톡 한 번 없으면서 네가 먼저 보내는 톡에는 5분 안에 칼답하는 건, 심심풀이 or 보험일 가능성이 높아.",
        before: "선톡 없음, 칼답",
        after: "보험 심리",
        verdictMessage: "간 보는 거야, 정신 차려.",
        triggers: ["선톡 없음","칼답"]
    },
    {
        message: "상대가 'ㅋㅋㅋ'만 10개 넘게 찍으면서 성의 없는 대답만 한다면, 너를 귀찮게 생각하고 있다는 간접적인 표현이야.",
        before: "'ㅋㅋㅋ' 남발",
        after: "귀찮아함",
        verdictMessage: "제대로 된 대화 상대를 찾아.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "만나자는 제안을 계속 미루는 건, 너와의 만남 자체를 꺼린다는 명백한 신호야. 자존심 좀 지켜.",
        before: "만남 거절",
        after: "만남 회피",
        verdictMessage: "질척거리지 마.",
        triggers: ["거부"]
    },
    {
        message: "네 카톡에 답장은 안 하면서 다른 사람 SNS에 좋아요 누르고 댓글 다는 거 봤지? 너 그냥 '을'이야.",
        before: "카톡 씹고 SNS 활동",
        after: "무시",
        verdictMessage: "정신 승리 그만해.",
        triggers: ["읽씹"]
    },
    {
        message: "매번 네가 먼저 연락하고, 상대방은 대답만 하는 패턴이라면, 너는 이미 '쉬운 사람'으로 낙인찍힌 거야.",
        before: "매번 선톡",
        after: "쉬운 사람 취급",
        verdictMessage: "가치를 높여.",
        triggers: ["연속톡"]
    },
    {
        message: "단답형 대답 뒤에 이모티콘 하나 툭 던지는 건, 더 이상 할 말이 없으니 귀찮게 하지 말라는 무언의 압박이야.",
        before: "단답 + 이모티콘",
        after: "귀찮음",
        verdictMessage: "그만 들이대.",
        triggers: ["단답","이모지"]
    },
    {
        message: "질문은 네가 하는데 대답은 항상 회피하거나 얼버무리는 건, 너에게 솔직해지고 싶지 않다는 뜻이야. 뭘 더 바래?",
        before: "질문 회피",
        after: "불성실",
        verdictMessage: "진실을 외면하지 마.",
        triggers: ["질문","거부"]
    },
    {
        message: "장문으로 톡 보내면 단답으로 답장 오는 패턴, 이제 지겹지도 않아? 너만 애닳는 관계는 빨리 정리하는 게 답이야.",
        before: "장문 - 단답 패턴",
        after: "무관심",
        verdictMessage: "손절만이 답.",
        triggers: ["장문","단답"]
    },
    {
        message: "상대방이 톡하다가 갑자기 사라지는 횟수가 늘어난다면, 너와의 대화가 지루해졌다는 뜻이야. 다른 사람 찾고 있겠지.",
        before: "톡하다 잠수",
        after: "지루함",
        verdictMessage: "미련 버려.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너의 톡 내용에 공감하는 척만 하고, 실제로 행동하는 모습은 전혀 보이지 않는다면, 너를 그냥 '만만한 사람'으로 생각하는 거야.",
        before: "공감만 하고 행동 X",
        after: "만만하게 봄",
        verdictMessage: "호구 탈출해."
    },
    {
        message: "모든 대화의 주도권을 상대방이 쥐고 흔든다면, 너는 그냥 꼭두각시 인형일 뿐이야. 주체적인 연애는 꿈도 못 꿀 거야.",
        before: "주도권 없음",
        after: "꼭두각시",
        verdictMessage: "자존감을 챙겨."
    },
    {
        message: "네가 먼저 연락하지 않으면, 상대방은 절대 연락하지 않는다면, 너는 이미 아웃 오브 안중이야.",
        before: "선톡 없음",
        after: "관심 없음",
        verdictMessage: "잊어.",
        triggers: ["선톡 없음"]
    },
    {
        message: "애매하게 답장하면서 썸인지 뭔지 간만 보는 상대를 왜 붙잡고 있어? 시간 낭비하지 말고 제대로 된 사람 만나.",
        before: "애매한 태도",
        after: "간 봄",
        verdictMessage: "정리해."
    },
    {
        message: "네가 아무리 노력해도 바뀌지 않는다면, 그건 그냥 안 되는 인연이야. 운명론을 믿어봐, 답이 나올 거야.",
        before: "노력해도 안됨",
        after: "안되는 인연",
        verdictMessage: "포기해."
    },
    {
        message: "상대가 '바빠서'라는 핑계를 입에 달고 산다면, 너와의 관계에 우선순위를 두고 싶지 않다는 뜻이야. 그만 매달려.",
        before: "바쁘다는 핑계",
        after: "우선순위 낮음",
        verdictMessage: "핑계에 속지마."
    },
    {
        message: "네가 보내는 카톡마다 '네', '넹' 같은 무성의한 답변만 돌아온다면, 너와의 대화에 전혀 집중하고 있지 않다는 증거야.",
        before: "무성의한 답변",
        after: "무관심",
        verdictMessage: "포기해, 답 없어.",
        triggers: ["단답"]
    },
    {
        message: "상대방이 너의 질문에 답은 안 하고, 자기 할 말만 계속 쏟아낸다면, 너를 대화 상대로 생각하지 않는다는 거야.",
        before: "질문 무시, 자기 말만",
        after: "무시",
        verdictMessage: "벽이랑 대화하는 거랑 뭐가 달라?",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "카톡으로만 연락하고, 전화 데이트는 죽어도 안 하려는 건, 목소리조차 듣고 싶지 않다는 뜻이야.",
        before: "전화 거부",
        after: "목소리 듣기 싫음",
        verdictMessage: "미련 버려, 넌 이미 아웃이야.",
        triggers: ["거부"]
    },
    {
        message: "매번 같은 이모티콘만 반복해서 보내는 건, 너에게 더 이상 신경 쓰고 싶지 않다는 명확한 신호야.",
        before: "같은 이모티콘 반복",
        after: "신경 안 씀",
        verdictMessage: "그만해, 너만 힘들어.",
        triggers: ["이모지"]
    },
    {
        message: "네가 무슨 말을 하든 딴소리하거나 화제를 돌리는 건, 너의 이야기에 전혀 관심이 없다는 뜻이야.",
        before: "화제 전환",
        after: "무관심",
        verdictMessage: "관심 구걸하지 마."
    },
    {
        message: "상대가 너에게 '착하다'는 말만 반복한다면, 너를 이성으로 보지 않는다는 간접적인 표현이야.",
        before: "착하다는 말만 함",
        after: "이성으로 안 봄",
        verdictMessage: "친구 이상은 힘들어."
    },
    {
        message: "상대가 너의 카톡을 읽고 답장하는 데 하루 이상 걸린다면, 너는 이미 우선순위에서 밀려난 거야.",
        before: "하루 이상 답장 지연",
        after: "우선순위 낮음",
        verdictMessage: "시간 낭비 하지 마.",
        triggers: ["느린 답장","읽씹"]
    },
    {
        message: "상대가 너에게 '다음에 보자'는 말을 습관처럼 하지만, 실제로 약속을 잡는 경우는 없다면, 그냥 형식적인 멘트일 뿐이야.",
        before: "'다음에 보자' 습관적",
        after: "거짓 약속",
        verdictMessage: "기대하지 마."
    },
    {
        message: "네가 아무리 열심히 톡을 보내도, 상대방은 띄엄띄엄 답장하거나 읽씹한다면, 너와의 관계를 귀찮아하는 거야.",
        before: "띄엄띄엄 답장, 읽씹",
        after: "귀찮아함",
        verdictMessage: "포기하는 게 답이야.",
        triggers: ["읽씹","느린 답장"]
    },
    {
        message: "상대가 너에게 연락은 먼저 안 하지만, 네가 연락하면 꼬박꼬박 답장은 한다면, 너를 '필요할 때만 찾는 사람'으로 생각하는 거야.",
        before: "선톡 X, 답장은 함",
        after: "필요할 때만 찾는 사람",
        verdictMessage: "이용당하지 마.",
        triggers: ["선톡 없음"]
    },
    {
        message: "상대가 너의 질문에 구체적인 답변 없이 '글쎄', '모르겠어' 등으로 얼버무린다면, 너에게 진실을 말하고 싶지 않다는 뜻이야.",
        before: "얼버무리는 답변",
        after: "숨김",
        verdictMessage: "진실을 외면하지 마.",
        triggers: ["질문","거부"]
    },
    {
        message: "상대가 너에게 칭찬은커녕, 은근히 무시하거나 비꼬는 말투를 사용한다면, 너를 존중하지 않는다는 거야.",
        before: "무시, 비꼬는 말투",
        after: "존중 X",
        verdictMessage: "자존감을 지켜."
    },
    {
        message: "네가 장문의 카톡을 보내면, 상대방은 짧은 답장만 보내는 패턴이 반복된다면, 너의 노력은 헛수고일 뿐이야.",
        before: "장문 - 단답 반복",
        after: "무관심",
        verdictMessage: "혼자 애쓰지 마.",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 너의 카톡을 읽씹하거나, 늦게 답장하면서 '이제 봤네'라는 뻔한 거짓말을 한다면, 너를 속이고 있는 거야.",
        before: "읽씹 후 '이제 봤네'",
        after: "거짓말",
        verdictMessage: "뻔한 거짓말에 속지 마.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 '우리 친구잖아'라는 말을 자주 한다면, 너를 이성으로 생각할 가능성은 거의 없어.",
        before: "'우리 친구잖아' 반복",
        after: "이성으로 안 봄",
        verdictMessage: "친구 이상은 힘들어."
    },
    {
        message: "상대가 너의 톡에 답장하는 척만 하고, 실제로 대화를 이어가려는 노력을 전혀 하지 않는다면, 너에게 관심이 없는 거야.",
        before: "답장만 하고 대화 X",
        after: "관심 없음",
        verdictMessage: "혼자 쇼하지 마.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 카톡에 답장하는 대신, 이모티콘만 툭 던지는 건, 너와의 대화를 귀찮아한다는 명확한 신호야.",
        before: "이모티콘으로 퉁침",
        after: "귀찮아함",
        verdictMessage: "그만 들이대.",
        triggers: ["이모지","단답"]
    },
    {
        message: "상대가 너에게 '나중에 연락할게'라고 말하고 연락이 없는 경우가 많다면, 그냥 빈말일 뿐이야. 기대하지 마.",
        before: "'나중에 연락할게' 후 연락 없음",
        after: "빈말",
        verdictMessage: "기대 버려."
    },
    {
        message: "상대가 너의 카톡에 답장하면서 계속 질문을 회피한다면, 너에게 숨기고 싶은 게 많다는 뜻이야. 뭘 기대하는 거야?",
        before: "질문 회피",
        after: "숨기는 게 많음",
        verdictMessage: "진실을 마주해.",
        triggers: ["질문","거부"]
    },
    {
        message: "상대가 너에게 '피곤하다'는 말을 자주 하면서 카톡을 일찍 끝낸다면, 너와의 대화가 지루하다는 뜻이야.",
        before: "'피곤하다'는 말 자주 함",
        after: "지루함",
        verdictMessage: "혼자 착각하지 마."
    },
    {
        message: "상대가 너의 카톡을 읽고 답장하는 데 몇 시간씩 걸리면서, SNS는 계속 업데이트한다면, 너를 완전히 무시하는 거야.",
        before: "카톡 씹고 SNS 업데이트",
        after: "무시",
        verdictMessage: "자존심을 지켜.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 너에게 '너는 좋은 사람이야'라는 말을 습관처럼 한다면, 너를 이성으로 보지 않는다는 방어기제일 뿐이야.",
        before: "'너는 좋은 사람이야' 반복",
        after: "방어기제",
        verdictMessage: "착한 사람은 친구로 남는다."
    },
    {
        message: "상대가 너에게 카톡으로 사적인 이야기는 전혀 하지 않고, 업무적인 이야기만 한다면, 너를 그 이상으로 생각하지 않는 거야.",
        before: "업무적인 이야기만 함",
        after: "거리 둠",
        verdictMessage: "선을 넘어가지 마."
    },
    {
        message: "상대가 너의 카톡에 답장하면서, 맞춤법이나 띄어쓰기를 일부러 틀리게 한다면, 너를 무시하거나 귀찮아하는 거야.",
        before: "맞춤법 틀림",
        after: "무시, 귀찮아함",
        verdictMessage: "존중받지 못하고 있어."
    },
    {
        message: "상대가 너에게 '네가 알아서 해'라는 말을 자주 한다면, 너에게 책임을 회피하고 싶어하는 거야.",
        before: "'네가 알아서 해' 반복",
        after: "책임 회피",
        verdictMessage: "혼자 짊어지지 마."
    },
    {
        message: "상대가 너에게 '나는 원래 연락을 잘 안 해'라는 말을 변명처럼 한다면, 너에게만 연락을 안 하는 거야.",
        before: "'원래 연락 안 해' 변명",
        after: "변명",
        verdictMessage: "핑계에 속지 마."
    },
    {
        message: "상대가 너의 카톡에 답장하면서, 내용과는 전혀 상관없는 뜬금없는 이모티콘을 보낸다면, 너와의 대화에 집중하지 않고 있다는 거야.",
        before: "뜬금없는 이모티콘",
        after: "집중 X",
        verdictMessage: "대화에 집중하지 않아.",
        triggers: ["이모지"]
    },
    {
        message: "상대가 너의 질문에 '비밀이야'라며 답을 회피하는 빈도가 잦다면, 너에게 마음을 열 생각이 없는 거야.",
        before: "'비밀이야' 반복",
        after: "마음을 열지 않음",
        verdictMessage: "선을 긋고 있어.",
        triggers: ["질문","거부"]
    },
    {
        message: "답장이 3시간 넘게 걸리는 건 핑계일 뿐. 당신과의 대화가 우선순위에서 밀린다는 명백한 증거야.",
        before: "3시간 이상 답장 지연",
        after: "상대방의 우선순위에서 밀림",
        verdictMessage: "시간 낭비 그만하고 현실을 직시해."
    },
    {
        message: "매번 당신만 질문하고 있어? 일방적인 관계는 결국 지쳐. 혼자 북 치고 장구 치는 꼴이야.",
        before: "계속되는 질문",
        after: "혼자만의 노력",
        verdictMessage: "상대방은 대화할 의지가 없어 보여. 그만 둬.",
        triggers: ["질문","혼자떠듦"]
    },
    {
        message: "단답형 대답만 돌아온다면 더 이상 노력할 가치가 없어. 벽이랑 대화하는 것 같잖아.",
        before: "지속적인 단답",
        after: "무성의한 태도",
        verdictMessage: "상대방은 당신에게 관심이 없어. 포기해.",
        triggers: ["단답"]
    },
    {
        message: "이모티콘으로 대화 때우려는 거 안 보여? 진심으로 대화하고 싶어하는 마음이 전혀 없는 거야.",
        before: "잦은 이모티콘 사용",
        after: "대화 회피",
        verdictMessage: "당신을 가볍게 생각하는 거야. 정신 차려.",
        triggers: ["이모지"]
    },
    {
        message: "읽씹 후 24시간 넘도록 연락 없으면 게임 끝난 거나 마찬가지야. 미련 버려.",
        before: "24시간 이상 읽씹",
        after: "관심 없음",
        verdictMessage: "상대는 당신에게 아무런 감정이 없어.",
        triggers: ["읽씹"]
    },
    {
        message: "매번 당신이 먼저 연락하는 패턴, 이제 멈춰. 상대는 당신을 당연하게 생각하고 있어.",
        before: "항상 먼저 연락",
        after: "상대의 무관심",
        verdictMessage: "관계를 주도하는 건 당신 혼자야. 이제 그만해.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "카톡 답장 속도가 점점 느려지는 건 마음이 식어가는 명확한 신호야. 이제 인정할 때도 됐잖아.",
        before: "점점 느려지는 답장 속도",
        after: "식어가는 마음",
        verdictMessage: "상대는 더 이상 당신에게 설레지 않아."
    },
    {
        message: "장문 카톡 보내는 정성, 상대는 부담스러워 할 뿐이야. 혼자 드라마 찍지 마.",
        before: "혼자 장문 카톡",
        after: "상대의 부담감",
        verdictMessage: "상대는 당신의 감정을 감당할 준비가 안 됐어.",
        triggers: ["장문","혼자떠듦"]
    },
    {
        message: "만나자는 말에 계속 핑계 대는 건 거절의 또 다른 표현이야. 눈치 좀 챙겨.",
        before: "만남 거절 (핑계)",
        after: "회피 심리",
        verdictMessage: "상대는 당신과의 만남을 원하지 않아.",
        triggers: ["거부"]
    },
    {
        message: "대화 내용이 점점 형식적으로 변하고 있다면, 관계도 끝을 향해 달려가고 있다는 증거야.",
        before: "형식적인 대화",
        after: "관계의 소멸",
        verdictMessage: "더 이상 의미 없는 관계에 매달리지 마."
    },
    {
        message: "ㅋㅋㅋ 도배는 긍정이 아니라 대화를 회피하려는 수법이야. 당신을 만만하게 보는 거지.",
        before: "많은 ㅋ 사용",
        after: "대화 회피, 무시",
        verdictMessage: "상대는 당신과의 대화를 진지하게 생각하지 않아.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "애매하게 '글쎄', '모르겠어' 같은 답변만 하는 건, 당신에게 확신을 줄 마음이 없다는 뜻이야.",
        before: "애매한 답변",
        after: "불확실한 태도",
        verdictMessage: "상대는 당신과의 관계에 확신이 없어.",
        triggers: ["단답"]
    },
    {
        message: "당신의 감정만 쏟아내는 건 이기적인 행동이야. 상대는 감정 쓰레기통이 아니야.",
        before: "감정 과잉",
        after: "상대의 피로감",
        verdictMessage: "상대는 당신의 감정을 받아줄 준비가 안 됐어.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "밤늦게 연락 오는 건 외로워서 당신을 찾는 걸 수도 있어. 진심이라고 착각하지 마.",
        before: "늦은 밤 연락",
        after: "외로움 해소",
        verdictMessage: "상대는 당신을 필요할 때만 찾는 거야."
    },
    {
        message: "상대가 당신의 질문을 회피한다면, 숨기는 게 많다는 뜻이야. 떳떳하지 못한 관계는 오래 못 가.",
        before: "질문 회피",
        after: "숨기는 것",
        verdictMessage: "상대는 당신에게 진실하지 않아.",
        triggers: ["질문"]
    },
    {
        message: "당신이 보내는 메시지에 '네' 혹은 '아니오' 외에 다른 반응이 없다면, 그는 당신을 지루하게 생각하고 있는 거야.",
        before: "단순한 대답",
        after: "지루함",
        verdictMessage: "상대는 당신과의 대화에 흥미를 느끼지 못해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하는 데 평균 12시간 이상 걸린다면, 당신은 그의 인생에서 그다지 중요한 사람이 아니야.",
        before: "12시간 이상 답장 지연",
        after: "낮은 우선순위",
        verdictMessage: "상대는 당신을 중요하게 생각하지 않아."
    },
    {
        message: "대화의 주제가 항상 상대방 위주라면, 그는 당신의 이야기에 관심이 없는 거야.",
        before: "상대방 중심 대화",
        after: "무관심",
        verdictMessage: "상대는 당신에게 진정으로 관심이 없어.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신의 메시지에 공감하는 척만 한다면, 그는 당신의 감정에 진정으로 공감하지 않는 거야.",
        before: "공감하는 척",
        after: "가짜 공감",
        verdictMessage: "상대는 당신의 감정에 진심으로 공감하지 않아."
    },
    {
        message: "상대가 당신의 메시지를 읽고 답장하지 않는 이유를 항상 변명한다면, 그는 당신에게 진실하지 않은 거야.",
        before: "변명",
        after: "거짓말",
        verdictMessage: "상대는 당신에게 솔직하지 않아.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신에게 '나중에 연락할게'라고 말하고 연락하지 않는다면, 그는 당신에게 연락할 마음이 없는 거야.",
        before: "'나중에 연락할게' 후 무소식",
        after: "연락 의지 없음",
        verdictMessage: "상대는 당신에게 연락할 생각이 없어."
    },
    {
        message: "상대가 당신의 메시지에 '응', '그래'와 같은 성의 없는 답변만 한다면, 그는 당신과의 대화에 지루함을 느끼는 거야.",
        before: "성의 없는 답변",
        after: "지루함",
        verdictMessage: "상대는 당신과의 대화에 흥미를 잃었어.",
        triggers: ["단답"]
    },
    {
        message: "상대가 당신과의 대화에서 개인적인 정보를 공유하지 않는다면, 그는 당신을 신뢰하지 않는 거야.",
        before: "개인 정보 공유 X",
        after: "불신",
        verdictMessage: "상대는 당신을 믿지 않아."
    },
    {
        message: "상대가 당신의 메시지에 긍정적인 반응을 보이지 않는다면, 그는 당신에게 호감이 없는 거야.",
        before: "부정적 반응",
        after: "비호감",
        verdictMessage: "상대는 당신에게 호감이 없어."
    },
    {
        message: "상대가 당신에게 먼저 연락하는 빈도가 점점 줄어든다면, 그는 당신에게 점점 멀어지고 있는 거야.",
        before: "연락 빈도 감소",
        after: "관계 소원",
        verdictMessage: "상대는 당신에게서 멀어지고 있어.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 당신의 메시지를 읽씹하고 다른 사람들과 소통한다면, 그는 당신을 무시하는 거야.",
        before: "읽씹 후 다른 사람과 소통",
        after: "무시",
        verdictMessage: "상대는 당신을 무시하고 있어.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신에게 '바빠서 연락 못 했다'는 말을 반복한다면, 그는 당신과의 관계를 유지하고 싶지 않은 거야.",
        before: "'바빠서' 반복",
        after: "관계 회피",
        verdictMessage: "상대는 당신과의 관계를 피하고 있어."
    },
    {
        message: "상대가 당신에게 항상 질문만 하고 자신의 이야기는 하지 않는다면, 그는 당신에게 마음을 열지 않은 거야.",
        before: "질문만 함",
        after: "마음의 벽",
        verdictMessage: "상대는 당신에게 마음을 열지 않았어.",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신의 메시지에 'ㅋㅋㅋ'만 남발한다면, 그는 당신과의 대화를 진지하게 생각하지 않는 거야.",
        before: "ㅋㅋㅋ 남발",
        after: "가벼움",
        verdictMessage: "상대는 당신과의 대화를 가볍게 생각해.",
        triggers: ["많은ㅋ"]
    },
    {
        message: "상대가 당신에게 '피곤하다'는 말을 자주 한다면, 그는 당신과의 대화에 지쳐있는 거야.",
        before: "'피곤하다' 자주 언급",
        after: "지침",
        verdictMessage: "상대는 당신과의 대화에 지쳐있어."
    },
    {
        message: "상대가 당신의 제안을 계속 거절한다면, 그는 당신과의 관계에 대한 의지가 없는 거야.",
        before: "제안 거절",
        after: "관계 의지 없음",
        verdictMessage: "상대는 당신과의 관계를 원하지 않아.",
        triggers: ["거부"]
    },
    {
        message: "상대가 당신에게 '우리는 친구잖아'라고 강조한다면, 그는 당신을 이성으로 생각하지 않는 거야.",
        before: "'친구' 강조",
        after: "이성으로 안 봄",
        verdictMessage: "상대는 당신을 친구로만 생각해."
    },
    {
        message: "상대가 당신의 메시지를 읽고 즉시 답장하지 않는다면, 그는 당신을 기다리게 하는 것을 즐기는 거야.",
        before: "고의적 답장 지연",
        after: "밀당",
        verdictMessage: "상대는 당신을 가지고 놀고 있어."
    },
    {
        message: "상대가 당신에게 '생각해볼게'라고 말하고 결정을 내리지 않는다면, 그는 당신에게 확신을 주지 않으려는 거야.",
        before: "'생각해볼게' 후 미결정",
        after: "확신 없음",
        verdictMessage: "상대는 당신에게 확신이 없어."
    },
    {
        message: "상대가 당신에게 무관심한 태도를 보인다면, 그는 당신과의 관계를 발전시킬 생각이 없는 거야.",
        before: "무관심",
        after: "관계 발전 의지 없음",
        verdictMessage: "상대는 당신과의 관계를 원하지 않아."
    },
    {
        message: "상대가 당신의 메시지를 읽씹하고 며칠 후에 답장한다면, 그는 당신을 완전히 잊고 있었던 거야.",
        before: "며칠 후 답장",
        after: "잊고 있었음",
        verdictMessage: "상대는 당신을 잊고 있었어.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 당신에게 '나중에 보자'고 말하고 실제로 만나지 않는다면, 그는 당신과의 만남을 피하는 거야.",
        before: "'나중에 보자' 후 불발",
        after: "만남 회피",
        verdictMessage: "상대는 당신과의 만남을 피하고 있어."
    },
    {
        message: "상대가 당신의 감정에 공감하지 못하고 비판적인 태도를 보인다면, 그는 당신을 이해하려는 노력을 하지 않는 거야.",
        before: "비판적 태도",
        after: "이해 부족",
        verdictMessage: "상대는 당신을 이해하려 하지 않아."
    },
    {
        message: "상대가 당신에게 칭찬이나 격려를 해주지 않는다면, 그는 당신의 장점을 발견하지 못했거나 인정하고 싶지 않은 거야.",
        before: "칭찬/격려 없음",
        after: "장점 발견 X",
        verdictMessage: "상대는 당신의 장점을 인정하지 않아."
    },
    {
        message: "상대가 당신의 질문에 대답하지 않거나 질문으로 되받아친다면, 그는 당신에게 솔직하게 말하고 싶지 않은 거야.",
        before: "질문 회피/되받아침",
        after: "불성실",
        verdictMessage: "상대는 당신에게 솔직하지 않아.",
        triggers: ["질문"]
    },
    {
        message: "상대가 당신에게 핑계를 대면서 약속을 취소한다면, 그는 당신과의 약속을 중요하게 생각하지 않는 거야.",
        before: "핑계로 약속 취소",
        after: "약속 경시",
        verdictMessage: "상대는 당신과의 약속을 중요하게 생각하지 않아.",
        triggers: ["거부"]
    },
    {
        message: "상대가 당신에게 돈을 빌려달라고 한다면, 그는 당신을 돈으로 보고 있는 거야. 연애 감정은 없어.",
        before: "돈 요구",
        after: "금전적 목적",
        verdictMessage: "상대는 당신을 돈으로만 생각해."
    },
    {
        message: "상대가 당신에게 과거 연애 이야기를 자주 한다면, 그는 아직 이전 연애를 잊지 못한 거야. 당신은 그냥 대체재일 뿐.",
        before: "과거 연애 이야기",
        after: "미련",
        verdictMessage: "상대는 아직 이전 연애를 잊지 못했어."
    },
    {
        message: "상대가 당신의 SNS 게시물에 좋아요나 댓글을 달지 않는다면, 그는 당신에게 관심이 없는 거야. 온라인에서도 마찬가지.",
        before: "SNS 반응 X",
        after: "무관심",
        verdictMessage: "상대는 당신에게 관심이 없어."
    },
    {
        message: "상대가 당신과 연락할 때 항상 자신의 자랑만 늘어놓는다면, 그는 당신을 자신의 성공을 과시하는 도구로 생각하는 거야. 질투 유발 전략일 수도.",
        before: "자랑만 늘어놓음",
        after: "과시",
        verdictMessage: "상대는 당신을 과시용으로 생각해.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 당신에게 계속해서 '너는 너무 착해'라고 말한다면, 그는 당신을 이성으로 보지 않는 거야. 착한 건 매력이 아니야.",
        before: "'착하다' 강조",
        after: "매력 없음",
        verdictMessage: "상대는 당신을 이성으로 보지 않아."
    },
    {
        message: "상대가 당신의 외모나 스타일에 대해 부정적인 말을 한다면, 그는 당신을 존중하지 않는 거야. 자존감 깎아먹는 사람은 만나지 마.",
        before: "외모 비하",
        after: "존중 부족",
        verdictMessage: "상대는 당신을 존중하지 않아."
    },
    {
        message: "답장이 5시간 넘게 걸리는 건, 네 메시지를 5시간 동안 묵혀둘 만큼의 가치만 준다는 뜻이야. 정신차려.",
        before: "5시간 이상 답장 지연",
        after: "상대방의 낮은 우선순위",
        verdictMessage: "가망 없음. 시간 낭비 중단.",
        triggers: ["느린답장"]
    },
    {
        message: "상대가 '음', '넹' 같은 단답만 보내는 건 대화하기 싫다는 명확한 신호야. 혼자 벽 보고 얘기하는 거랑 뭐가 달라?",
        before: "단답형 응답",
        after: "대화 거부 의사",
        verdictMessage: "관심 없음. 에너지 낭비하지 마.",
        triggers: ["단답","거부"]
    },
    {
        message: "계속 네가 먼저 연락하고, 상대는 답장만 하는 상황? 그건 대화가 아니라 네가 일방적으로 구걸하는 거야.",
        before: "일방적인 연락",
        after: "상대방의 수동적인 태도",
        verdictMessage: "주도권 없음. 관계 개선 불가.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "읽고 답이 없다는 건, 너라는 존재 자체가 지금 당장 상대에게 아무런 의미가 없다는 뜻이야. 자존심 좀 지켜.",
        before: "읽씹 후 장시간 무응답",
        after: "무가치한 존재로 인식",
        verdictMessage: "존재 가치 무시. 관계 정리 필요.",
        triggers: ["읽씹"]
    },
    {
        message: "상대가 ㅋㅋㅋ만 남발하며 대화 내용 없이 넘기려 한다면, 너와의 대화 자체를 귀찮아하는 거야. 그만 들이대.",
        before: "과도한 'ㅋㅋㅋ' 사용",
        after: "대화 회피 심리",
        verdictMessage: "대화 거부. 더 이상 노력 불필요.",
        triggers: ["많은ㅋ","단답"]
    },
    {
        message: "네 장문 카톡에 단답으로 답하는 건, '읽었으니 됐지?' 하는 심보야. 존중받지 못하는 관계는 끝내야 해.",
        before: "장문 메시지에 대한 단답",
        after: "무시하는 태도",
        verdictMessage: "존중 결여. 관계 단절 고려.",
        triggers: ["장문","단답"]
    },
    {
        message: "상대가 질문에만 답하고, 너에게는 질문을 안 한다면, 너에 대해 알고 싶어 하는 마음이 0%라는 증거야.",
        before: "일방적인 질문",
        after: "상대방의 무관심",
        verdictMessage: "무관심. 발전 가능성 없음.",
        triggers: ["질문","거부"]
    },
    {
        message: "계속 '바빠서', '나중에'라는 핑계만 대는 건, 너와의 관계에 투자할 시간이 아깝다는 뜻이야. 현실을 직시해.",
        before: "'바쁨'을 이유로 회피",
        after: "관계 투자 회피",
        verdictMessage: "회피성 핑계. 관계 포기.",
        triggers: ["거부"]
    },
    {
        message: "상대가 이모티콘으로만 대화를 때우려는 건, 너와의 진솔한 대화 자체가 싫다는 거야. 포기하는 게 답이다.",
        before: "과도한 이모티콘 사용",
        after: "대화 회피",
        verdictMessage: "대화 거부. 관계 종료.",
        triggers: ["이모지","단답"]
    },
    {
        message: "네 카톡에 답장이 3일 넘게 없다면, 그건 연락을 잊은 게 아니라, 너를 잊고 싶어 하는 거야.",
        before: "3일 이상 무응답",
        after: "잊고 싶어함",
        verdictMessage: "관계 소멸. 미련 버려.",
        triggers: ["읽씹"]
    },
    {
        message: "네가 먼저 연락하지 않으면 연락이 끊기는 관계는, 이미 끝난 거나 마찬가지야. 혼자 애쓰지 마.",
        before: "선톡 없이는 관계 단절",
        after: "수동적인 관계",
        verdictMessage: "일방적 관계. 정리 권유.",
        triggers: ["연속톡","혼자떠듦"]
    },
    {
        message: "상대가 네 이야기에 공감 없이 자기 이야기만 늘어놓는다면, 너는 그냥 상담사일 뿐이야. 이용당하지 마.",
        before: "자기 이야기만 함",
        after: "이용 심리",
        verdictMessage: "이용 관계. 관계 재고.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "매번 네가 맞춰주고 양보하는 관계는, 결국 너만 지쳐 나가떨어지게 돼. 지금이라도 멈춰.",
        before: "일방적인 양보",
        after: "지쳐나감",
        verdictMessage: "불균형 관계. 즉시 중단.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 네 카톡을 읽고 몇 시간 뒤에 '이제 봤네'라고 답하는 건, 뻔한 거짓말이야. 더 이상 속지 마.",
        before: "'이제 봤네' 변명",
        after: "거짓말",
        verdictMessage: "뻔한 거짓말. 관계 종료.",
        triggers: ["거부","읽씹"]
    },
    {
        message: "네가 보낸 질문에 대답 없이 다른 이야기로 넘어가는 건, 너의 질문을 무시하는 행위야. 무시당하지 마.",
        before: "질문 회피",
        after: "무시",
        verdictMessage: "질문 무시. 관계 중단.",
        triggers: ["질문","거부"]
    },
    {
        message: "상대가 너의 감정 표현에 무덤덤하게 반응한다면, 너에게 아무런 감정이 없다는 뜻이야. 기대하지 마.",
        before: "감정 표현에 무덤덤",
        after: "무감정",
        verdictMessage: "감정 없음. 포기 권유.",
        triggers: ["단답"]
    },
    {
        message: "계속 '나중에 연락할게'라고만 하고 연락 없는 건, 그냥 너에게 연락하고 싶지 않다는 돌려 말하기야. 알아들어.",
        before: "'나중에 연락' 후 연락 없음",
        after: "연락 회피",
        verdictMessage: "연락 거부. 미련 금지.",
        triggers: ["거부"]
    },
    {
        message: "네가 상대방의 기분 맞춰주려고 전전긍긍하는 모습, 안쓰러워. 그럴 가치 없는 사람이야.",
        before: "상대방 기분 맞추려 노력",
        after: "불필요한 노력",
        verdictMessage: "불필요한 노력. 관계 정리.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 네 연락을 기다린다는 말만 하고 실제로 기다리지 않는다면, 너를 그냥 '보험'으로 생각하는 거야.",
        before: "말로만 기다림",
        after: "보험 심리",
        verdictMessage: "보험 심리. 손절 필수.",
        triggers: ["거부"]
    },
    {
        message: "상대가 네 메시지를 읽고 답장하는 데 24시간 이상 걸린다면, 너는 그냥 카톡 친구 목록에 있는 한 명일 뿐이야.",
        before: "24시간 이상 답장 지연",
        after: "카톡 친구 1",
        verdictMessage: "단순한 지인. 관계 정리.",
        triggers: ["느린답장"]
    },
    {
        message: "네가 뭘 하든 시큰둥한 반응 보이는 사람은 너한테 관심 없는 거야. 제발 눈치 좀 챙겨.",
        before: "시큰둥한 반응",
        after: "무관심",
        verdictMessage: "무관심. 포기해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 '귀찮아' '피곤해' 같은 말 자주 하는 건, 너랑 대화하는 게 고역이라는 뜻이야.",
        before: "'귀찮아', '피곤해' 자주 사용",
        after: "대화 거부",
        verdictMessage: "대화 기피. 그만 둬.",
        triggers: ["거부"]
    },
    {
        message: "네가 열심히 쓴 카톡에 'ㅇㅇ' 한 글자 오는 거, 너 무시하는 거야. 더 이상 자존심 깎아먹지 마.",
        before: "성의 없는 'ㅇㅇ' 답변",
        after: "무시",
        verdictMessage: "무시. 관계 끊어.",
        triggers: ["단답"]
    },
    {
        message: "상대가 네 질문에 빙빙 돌려 말하는 건, 너에게 진실을 말할 가치를 못 느낀다는 거야.",
        before: "애매한 답변",
        after: "진실 회피",
        verdictMessage: "진실 회피. 희망 없어.",
        triggers: ["거부"]
    },
    {
        message: "네가 먼저 만나자고 안 하면 데이트는 꿈도 못 꾸는 사이? 안타깝지만, 너 혼자만의 로맨스야.",
        before: "선약속 없이는 만남 불가",
        after: "일방적인 관계",
        verdictMessage: "일방적 관계. 정리해.",
        triggers: ["연속톡"]
    },
    {
        message: "상대가 너에게 과거 이야기만 하고 미래에 대한 언급이 없다면, 너는 현재의 '심심풀이'일 뿐이야.",
        before: "과거 이야기만 함",
        after: "심심풀이",
        verdictMessage: "일시적 관계. 시간 낭비.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "네가 아무리 노력해도 상대방의 카톡 스타일이 변하지 않는다면, 너를 배려할 마음이 없는 거야. 포기해.",
        before: "노력에도 변화 없음",
        after: "배려 없음",
        verdictMessage: "배려 결여. 헛수고.",
        triggers: ["단답","거부"]
    },
    {
        message: "상대가 네 카톡 내용과 상관없는 뜬금없는 답을 한다면, 너의 말을 제대로 듣고 있지 않다는 증거야. 의미 없어.",
        before: "동문서답",
        after: "경청하지 않음",
        verdictMessage: "소통 불가. 끝내.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너에게 '너는 너무 착해'라는 말을 자주 한다면, 너를 이성으로 보지 않는다는 뜻이야. 친구 이상은 힘들어.",
        before: "'너는 너무 착해' 발언",
        after: "이성적 매력 X",
        verdictMessage: "친구 관계. 발전 불가.",
        triggers: ["거부"]
    },
    {
        message: "네가 새벽까지 답장을 기다리게 만드는 사람은, 너의 밤을 괴롭게 만드는 사람일 뿐이야. 그만 기다려.",
        before: "늦은 시간까지 답장 기다림",
        after: "고통",
        verdictMessage: "고통 유발. 관계 단절.",
        triggers: ["느린답장"]
    },
    {
        message: "상대가 네 연락에 며칠 뒤 '미안, 깜빡했어'라고 답하는 건, 널 얼마나 하찮게 여기는지 보여주는 거야.",
        before: "'깜빡했어' 변명",
        after: "무시",
        verdictMessage: "존재 무시. 손절.",
        triggers: ["읽씹","거부"]
    },
    {
        message: "네가 무슨 말을 해도 '그렇구나'로 끝나는 대화, 너 혼자 북 치고 장구 치는 거야. 그만해.",
        before: "'그렇구나' 로 끝나는 대화",
        after: "무성의한 반응",
        verdictMessage: "단절된 대화. 포기해.",
        triggers: ["단답"]
    },
    {
        message: "상대가 너의 질문에 답은 안 하고 이모티콘만 보내는 건, 대화할 의지가 전혀 없다는 뜻이야. 시간 낭비하지 마.",
        before: "이모티콘으로 회피",
        after: "대화 거부",
        verdictMessage: "대화 거부. 포기 권유.",
        triggers: ["질문","이모지","거부"]
    },
    {
        message: "네가 '보고 싶다'고 했을 때, 상대방이 '나도'라는 말 없이 다른 말을 한다면, 너를 보고 싶어 하지 않는 거야.",
        before: "'보고싶다'에 대한 회피",
        after: "보고 싶지 않음",
        verdictMessage: "감정 회피. 끝내.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너에게 '너는 너무 솔직해'라고 말하는 건, 너의 진심이 부담스럽다는 뜻이야. 더 이상 솔직할 필요 없어.",
        before: "'너무 솔직해' 발언",
        after: "부담스러움",
        verdictMessage: "부담감. 감정 숨겨.",
        triggers: ["거부"]
    },
    {
        message: "상대가 너와 카톡 할 때는 답장이 빠르지만, 실제로 만나면 휴대폰만 보고 있다면, 너는 그냥 '카톡 친구'일 뿐이야.",
        before: "만나서 휴대폰만 봄",
        after: "가벼운 관계",
        verdictMessage: "피상적인 관계. 정리해.",
        triggers: ["단답"]
    },
    {
        message: "네가 상대방의 스케줄에 맞춰 모든 것을 바꾸는 건, 너 자신을 잃어버리는 짓이야. 제발 정신 차려.",
        before: "상대방 스케줄에 맞춤",
        after: "자아 상실",
        verdictMessage: "자아 상실. 즉시 중단.",
        triggers: ["혼자떠듦"]
    },
    {
        message: "상대가 너의 카톡에 공감하는 척만 하고, 실제로 공감하는 행동을 보이지 않는다면, 너를 속이고 있는 거야.",
        before: "말로만 공감",
        after: "기만",
        verdictMessage: "기만. 관계 청산.",
        triggers: ["단답"]
    },
    {
        message: "네가 먼저 연락하지 않으면, 상대방은 절대 먼저 연락하지 않는다면, 너는 '필요할 때만 찾는 존재'일 뿐이야.",
        before: "선톡 없으면 연락 끊김",
        after: "필요한 존재",
        verdictMessage: "필요할 때만 찾는 관계. 정리.",
        triggers: ["연속톡","혼자떠듦"]
    }
];
