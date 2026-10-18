@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe

%NODE% %REA% inspect-android-class %APK% G2.j > D:\REA\out-class-G2j.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-class-G2j.txt D:\REA\out-class-G2j.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% G2.m > D:\REA\out-class-G2m.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-class-G2m.txt D:\REA\out-class-G2m.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% f3.h > D:\REA\out-class-f3h.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-class-f3h.txt D:\REA\out-class-f3h.utf8.txt
echo c3=%ERRORLEVEL%
