# 톡캐디 (TalkCaddy) TWA - 프로덕션 빌드 & 배포 가이드

## 개요
PWABuilder로 생성된 Trusted Web Activity(TWA) Android 앱입니다.
`talkcaddy-nnm5gwq6.manus.space` 웹앱을 네이티브 Android 앱으로 래핑합니다.

## 현재 버전
- **versionCode**: 3
- **versionName**: 1.1.0
- **패키지명**: `space.manus.talkcaddy_nnm5gwq6.twa`
- **compileSdk**: 36 / **targetSdk**: 35 / **minSdk**: 23

## 사전 준비
1. **Android Studio** (최신 버전 권장)
2. **JDK 17** 이상
3. **signing.keystore** 파일 (Google Drive 패키지에 포함됨 - 리포에는 보안상 미포함)

---

## 빠른 빌드 (스크립트)

```bash
cd android-twa

# 1. keystore.properties 설정
cp keystore.properties.example keystore.properties
# keystore.properties 파일을 열고 비밀번호 입력

# 2. signing.keystore 파일을 이 디렉토리에 복사

# 3. 빌드 실행
./build-release.sh
```

---

## 수동 빌드

### 1. 프로젝트 열기
Android Studio에서 `android-twa/` 폴더를 프로젝트로 엽니다.

### 2. Signing 설정
`keystore.properties.example`을 `keystore.properties`로 복사하고 비밀번호를 입력합니다:

```properties
storeFile=signing.keystore
storePassword=실제_비밀번호
keyAlias=my-key-alias
keyPassword=실제_비밀번호
```

### 3. AAB 빌드
```bash
cd android-twa
./gradlew bundleRelease
```
결과: `app/build/outputs/bundle/release/app-release.aab`

### 4. APK 빌드 (테스트용)
```bash
./gradlew assembleRelease
```

---

## Google Play 프로덕션 배포 체크리스트

### 배포 전 확인사항
- [ ] Digital Asset Links 확인 (`/.well-known/assetlinks.json` 웹서버에 배치)
- [ ] `keystore.properties` 설정 완료
- [ ] `signing.keystore` 파일 준비
- [ ] `./build-release.sh` 빌드 성공

### Digital Asset Links
`assetlinks.json` 파일이 아래 URL에서 접근 가능해야 합니다:
```
https://talkcaddy-nnm5gwq6.manus.space/.well-known/assetlinks.json
```

### Play Console 업로드 절차
1. [Google Play Console](https://play.google.com/console) 접속
2. 톡캐디 앱 선택
3. **프로덕션** → **새 릴리스 만들기**
4. `app-release.aab` 업로드
5. 릴리스 노트 입력 (`playstore/ko-KR/release_notes.txt` 참고)
6. **검토 시작** 클릭

### Play Store 등록정보
`playstore/ko-KR/` 디렉토리에 준비된 텍스트:
- `title.txt` - 앱 이름
- `short_description.txt` - 짧은 설명 (80자 이내)
- `full_description.txt` - 전체 설명
- `release_notes.txt` - 릴리스 노트

### 추가 필요 항목 (Play Console에서 직접 설정)
- [ ] 앱 스크린샷 (최소 2장, 권장 사이즈: 1080x1920)
- [ ] 그래픽 이미지 (1024x500)
- [ ] 개인정보처리방침 URL
- [ ] 앱 카테고리: 스포츠
- [ ] 콘텐츠 등급 설문 작성
- [ ] 타겟 연령층 설정

---

## v1.0.0.0 → v1.1.0 변경사항
- versionCode: 1 → 3 (Play Store 비공개 테스트 versionCode 2보다 높음)
- jcenter() → mavenCentral() 마이그레이션 (jcenter deprecated)
- lintOptions → lint 블록으로 변경 (AGP 8.x 호환)
- Java source/target: 1.8 → 17 (JDK 21 호환)
- Release signing을 keystore.properties 외부 파일로 분리
- 보안 파일(.keystore, keystore.properties 등) .gitignore 처리
- Play Store 등록정보 메타데이터 추가
- 빌드 자동화 스크립트 추가 (build-release.sh)
