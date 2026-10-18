@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% A2.m > D:\REA\out-class-A2m.txt 2>&1
%NODE% %D% D:\REA\out-class-A2m.txt D:\REA\out-class-A2m.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% q.e > D:\REA\out-class-qe.txt 2>&1
%NODE% %D% D:\REA\out-class-qe.txt D:\REA\out-class-qe.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% G2.P > D:\REA\out-class-G2P.txt 2>&1
%NODE% %D% D:\REA\out-class-G2P.txt D:\REA\out-class-G2P.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% f3.m > D:\REA\out-class-f3m.txt 2>&1
%NODE% %D% D:\REA\out-class-f3m.txt D:\REA\out-class-f3m.utf8.txt
echo c4=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% f3.g > D:\REA\out-class-f3g.txt 2>&1
%NODE% %D% D:\REA\out-class-f3g.txt D:\REA\out-class-f3g.utf8.txt
echo c5=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% f3.a > D:\REA\out-class-f3a.txt 2>&1
%NODE% %D% D:\REA\out-class-f3a.txt D:\REA\out-class-f3a.utf8.txt
echo c6=%ERRORLEVEL%
echo ALLDONE
