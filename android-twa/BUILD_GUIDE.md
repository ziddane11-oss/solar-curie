# 톡캐디 (TalkCaddy) TWA - 프로덕션 빌드 가이드

## 개요
이 프로젝트는 PWABuilder로 생성된 Trusted Web Activity(TWA) Android 앱입니다.
`talkcaddy-nnm5gwq6.manus.space` 웹앱을 네이티브 Android 앱으로 래핑합니다.

## 현재 버전
- **versionCode**: 3
- **versionName**: 1.1.0
- **패키지명**: `space.manus.talkcaddy_nnm5gwq6.twa`
- **targetSdk**: 35
- **minSdk**: 23

## 사전 준비
1. **Android Studio** (최신 버전 권장)
2. **JDK 17** 이상
3. **signing.keystore** 파일 (Google Drive 패키지에 포함됨 - 리포에는 보안상 미포함)

## 빌드 방법

### 1. 프로젝트 열기
Android Studio에서 `android-twa/` 폴더를 프로젝트로 엽니다.

### 2. Signing 설정
`android-twa/app/build.gradle`의 `android` 블록에 서명 설정을 추가합니다:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('../signing.keystore')
            storePassword '여기에_비밀번호'
            keyAlias 'my-key-alias'
            keyPassword '여기에_비밀번호'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
        }
    }
}
```

> **주의**: 비밀번호를 코드에 직접 넣지 마세요. `gradle.properties`나 환경 변수를 사용하세요:
> ```properties
> # gradle.properties (gitignore에 추가할 것)
> STORE_PASSWORD=여기에_비밀번호
> KEY_PASSWORD=여기에_비밀번호
> ```

### 3. AAB 빌드
```bash
cd android-twa
./gradlew bundleRelease
```

빌드 결과: `app/build/outputs/bundle/release/app-release.aab`

### 4. APK 빌드 (테스트용)
```bash
./gradlew assembleRelease
```

## Google Play 프로덕션 출시

### Digital Asset Links 확인
`assetlinks.json` 파일을 웹서버의 `/.well-known/assetlinks.json` 경로에 배치해야 합니다:
```
https://talkcaddy-nnm5gwq6.manus.space/.well-known/assetlinks.json
```

### Play Console 업로드
1. Google Play Console → 톡캐디 앱
2. 프로덕션 → 새 릴리스 만들기
3. `app-release.aab` 업로드
4. 출시 노트 작성 후 검토 제출

## v1.0.0.0 → v1.1.0 변경사항
- versionCode: 1 → 3 (Play Store 비공개 테스트 versionCode 2보다 높음)
- jcenter() → mavenCentral() 마이그레이션 (jcenter deprecated 대응)
- lintOptions → lint 블록으로 변경 (AGP 8.x 호환)
- 보안 파일(.keystore, signing-key-info.txt 등) .gitignore 처리
