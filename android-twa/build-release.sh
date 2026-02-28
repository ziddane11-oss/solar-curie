#!/bin/bash
set -e

# ============================================
# 톡캐디 TWA - 프로덕션 Release AAB 빌드 스크립트
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo " 톡캐디 TWA - Release Build"
echo "========================================="

# 1. keystore.properties 확인
if [ ! -f "keystore.properties" ]; then
    echo ""
    echo "[ERROR] keystore.properties 파일이 없습니다."
    echo ""
    echo "다음 단계를 따라주세요:"
    echo "  1. cp keystore.properties.example keystore.properties"
    echo "  2. keystore.properties 파일을 열고 비밀번호를 입력하세요"
    echo "  3. signing.keystore 파일을 이 디렉토리에 복사하세요"
    echo ""
    exit 1
fi

# 2. signing.keystore 확인
STORE_FILE=$(grep 'storeFile' keystore.properties | cut -d'=' -f2 | tr -d '[:space:]')
if [ ! -f "$STORE_FILE" ]; then
    echo ""
    echo "[ERROR] 서명 키 파일을 찾을 수 없습니다: $STORE_FILE"
    echo "Google Drive 패키지에서 signing.keystore 파일을 이 디렉토리로 복사해 주세요."
    echo ""
    exit 1
fi

echo ""
echo "[1/3] 이전 빌드 정리..."
./gradlew clean

echo ""
echo "[2/3] Release AAB 빌드 중..."
./gradlew bundleRelease

AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo ""
    echo "========================================="
    echo " BUILD SUCCESSFUL!"
    echo "========================================="
    echo ""
    echo " AAB 파일: $AAB_PATH"
    echo " 파일 크기: $AAB_SIZE"
    echo ""
    echo " 다음 단계:"
    echo "   1. Google Play Console 열기"
    echo "   2. 프로덕션 → 새 릴리스 만들기"
    echo "   3. 위 AAB 파일 업로드"
    echo "   4. 릴리스 노트 입력 (playstore/ko-KR/release_notes.txt 참고)"
    echo "   5. 검토 후 출시"
    echo ""
else
    echo ""
    echo "[ERROR] AAB 빌드 실패. 위 에러 로그를 확인해 주세요."
    exit 1
fi
