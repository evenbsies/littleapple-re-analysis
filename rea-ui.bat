@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-method %APK% G2.j K > D:\REA\out-m-G2j-K.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-K.txt D:\REA\out-m-G2j-K.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% A0.a c > D:\REA\out-m-A0a-c.txt 2>&1
%NODE% %D% D:\REA\out-m-A0a-c.txt D:\REA\out-m-A0a-c.utf8.txt
echo m2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% A0.a > D:\REA\out-class-A0a.txt 2>&1
%NODE% %D% D:\REA\out-class-A0a.txt D:\REA\out-class-A0a.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% e3.k > D:\REA\out-class-e3k.txt 2>&1
%NODE% %D% D:\REA\out-class-e3k.txt D:\REA\out-class-e3k.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% G2.X > D:\REA\out-class-G2X.txt 2>&1
%NODE% %D% D:\REA\out-class-G2X.txt D:\REA\out-class-G2X.utf8.txt
echo c3=%ERRORLEVEL%
echo ALLDONE
