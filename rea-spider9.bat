@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% h5.q > D:\REA\os-class-h5q.txt 2>&1
%NODE% %D% D:\REA\os-class-h5q.txt D:\REA\os-class-h5q.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.p e > D:\REA\os-m-N2p-e.txt 2>&1
%NODE% %D% D:\REA\os-m-N2p-e.txt D:\REA\os-m-N2p-e.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.p g > D:\REA\os-m-N2p-g.txt 2>&1
%NODE% %D% D:\REA\os-m-N2p-g.txt D:\REA\os-m-N2p-g.utf8.txt
echo m2=%ERRORLEVEL%
echo ALLDONE
