// generated_messages.json을 roastDatabase.js에 통합하는 스크립트
const fs = require('fs');
const path = require('path');

// 생성된 메시지 로드
const generatedPath = path.join(__dirname, '../generated_messages.json');
const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf-8'));

// 기존 roastDatabase.js 읽기
const dbPath = path.join(__dirname, '../src/data/roastDatabase.js');
let dbContent = fs.readFileSync(dbPath, 'utf-8');

// 각 카테고리별로 메시지 추가
function formatMessages(messages) {
    return messages.map(msg => {
        const triggers = msg.triggers && msg.triggers.length > 0
            ? `\n        triggers: ${JSON.stringify(msg.triggers)}`
            : '';

        return `    {
        message: ${JSON.stringify(msg.message)},
        before: ${JSON.stringify(msg.before)},
        after: ${JSON.stringify(msg.after)},
        verdictMessage: ${JSON.stringify(msg.verdictMessage)}${triggers}
    }`;
    }).join(',\n');
}

// 카테고리별 교체
const replacements = {
    'POSITIVE_STRONG': {
        pattern: /const POSITIVE_STRONG = \[[\s\S]*?\];/,
        content: `const POSITIVE_STRONG = [\n${formatMessages(generated.POSITIVE_STRONG)}\n];`
    },
    'POSITIVE_MEDIUM': {
        pattern: /const POSITIVE_MEDIUM = \[[\s\S]*?\];/,
        content: `const POSITIVE_MEDIUM = [\n${formatMessages(generated.POSITIVE_MEDIUM)}\n];`
    },
    'POSITIVE_SOFT': {
        pattern: /const POSITIVE_SOFT = \[[\s\S]*?\];/,
        content: `const POSITIVE_SOFT = [\n${formatMessages(generated.POSITIVE_SOFT)}\n];`
    },
    'NEGATIVE_SOFT': {
        pattern: /const NEGATIVE_SOFT = \[[\s\S]*?\];/,
        content: `const NEGATIVE_SOFT = [\n${formatMessages(generated.NEGATIVE_SOFT)}\n];`
    },
    'NEGATIVE_MEDIUM': {
        pattern: /const NEGATIVE_MEDIUM = \[[\s\S]*?\];/,
        content: `const NEGATIVE_MEDIUM = [\n${formatMessages(generated.NEGATIVE_MEDIUM)}\n];`
    },
    'NEGATIVE_STRONG': {
        pattern: /const NEGATIVE_STRONG = \[[\s\S]*?\];/,
        content: `const NEGATIVE_STRONG = [\n${formatMessages(generated.NEGATIVE_STRONG)}\n];`
    }
};

// 각 카테고리 교체
for (const [category, { pattern, content }] of Object.entries(replacements)) {
    if (pattern.test(dbContent)) {
        dbContent = dbContent.replace(pattern, content);
        console.log(`✓ ${category} ${generated[category].length}개 통합 완료`);
    } else {
        console.error(`✗ ${category} 패턴 찾을 수 없음`);
    }
}

// 백업 생성
const backupPath = dbPath + '.backup';
fs.writeFileSync(backupPath, fs.readFileSync(dbPath), 'utf-8');
console.log(`\n백업 생성: ${backupPath}`);

// 업데이트된 파일 저장
fs.writeFileSync(dbPath, dbContent, 'utf-8');

console.log(`\n✅ roastDatabase.js 업데이트 완료`);
console.log(`총 ${Object.values(generated).flat().length}개 메시지 통합`);
