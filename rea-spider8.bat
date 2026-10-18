@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% F2.b > D:\REA\os-class-F2b.txt 2>&1
%NODE% %D% D:\REA\os-class-F2b.txt D:\REA\os-class-F2b.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% F2.b P > D:\REA\os-m-F2b-P.txt 2>&1
%NODE% %D% D:\REA\os-m-F2b-P.txt D:\REA\os-m-F2b-P.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% q > D:\REA\os-class-q.txt 2>&1
%NODE% %D% D:\REA\os-class-q.txt D:\REA\os-class-q.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% A3.c > D:\REA\os-class-A3c.txt 2>&1
%NODE% %D% D:\REA\os-class-A3c.txt D:\REA\os-class-A3c.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% G2.I > D:\REA\os-class-G2I.txt 2>&1
%NODE% %D% D:\REA\os-class-G2I.txt D:\REA\os-class-G2I.utf8.txt
echo c4=%ERRORLEVEL%
echo ALLDONE
