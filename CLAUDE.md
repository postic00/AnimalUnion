# 프로젝트 규칙

## 안드로이드 빌드 & 푸시 순서

커밋 후 푸시할 때는 반드시 아래 순서를 따른다:

1. **웹 빌드**
   ```
   npm run build
   ```

2. **Capacitor 싱크**
   ```
   npx cap sync android
   ```

3. **안드로이드 빌드** (JAVA_HOME 필요)
   ```
   JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
     cd android && ./gradlew assembleDebug
   ```

4. **APK 확인 및 복사**
   ```
   cp android/app/build/outputs/apk/debug/app-debug.apk public/app-debug.apk
   ```

5. **커밋 & 푸시**
   ```
   git add ...
   git commit -m "..."
   git push
   ```
