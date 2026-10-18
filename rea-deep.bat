@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% A0.m > D:\REA\out-class-A0m.txt 2>&1
%NODE% %D% D:\REA\out-class-A0m.txt D:\REA\out-class-A0m.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% E5.m > D:\REA\out-class-E5m.txt 2>&1
%NODE% %D% D:\REA\out-class-E5m.txt D:\REA\out-class-E5m.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% S > D:\REA\out-class-S.txt 2>&1
%NODE% %D% D:\REA\out-class-S.txt D:\REA\out-class-S.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% G2.j --method-name J > D:\REA\out-trace-G2j-J.txt 2>&1
%NODE% %D% D:\REA\out-trace-G2j-J.txt D:\REA\out-trace-G2j-J.utf8.txt
echo t1=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% f3.h --method-name q > D:\REA\out-trace-f3h-q.txt 2>&1
%NODE% %D% D:\REA\out-trace-f3h-q.txt D:\REA\out-trace-f3h-q.utf8.txt
echo t2=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% G2.j --method-name e > D:\REA\out-trace-G2j-e.txt 2>&1
%NODE% %D% D:\REA\out-trace-G2j-e.txt D:\REA\out-trace-G2j-e.utf8.txt
echo t3=%ERRORLEVEL%
echo ALLDONE
