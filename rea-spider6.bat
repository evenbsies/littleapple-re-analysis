@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% F2.a > D:\REA\os-class-F2a.txt 2>&1
%NODE% %D% D:\REA\os-class-F2a.txt D:\REA\os-class-F2a.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% F2.a A > D:\REA\os-m-F2a-A.txt 2>&1
%NODE% %D% D:\REA\os-m-F2a-A.txt D:\REA\os-m-F2a-A.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.l call > D:\REA\os-m-N2l-call.txt 2>&1
%NODE% %D% D:\REA\os-m-N2l-call.txt D:\REA\os-m-N2l-call.utf8.txt
echo m2=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.m call > D:\REA\os-m-N2m-call.txt 2>&1
%NODE% %D% D:\REA\os-m-N2m-call.txt D:\REA\os-m-N2m-call.utf8.txt
echo m3=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.n call > D:\REA\os-m-N2n-call.txt 2>&1
%NODE% %D% D:\REA\os-m-N2n-call.txt D:\REA\os-m-N2n-call.utf8.txt
echo m4=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.o call > D:\REA\os-m-N2o-call.txt 2>&1
%NODE% %D% D:\REA\os-m-N2o-call.txt D:\REA\os-m-N2o-call.utf8.txt
echo m5=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% F2.a > D:\REA\os-trace-F2a.txt 2>&1
%NODE% %D% D:\REA\os-trace-F2a.txt D:\REA\os-trace-F2a.utf8.txt
echo t1=%ERRORLEVEL%
echo ALLDONE
