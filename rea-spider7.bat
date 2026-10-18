@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-method %APK% h5.c A > D:\REA\os-m-h5c-A.txt 2>&1
%NODE% %D% D:\REA\os-m-h5c-A.txt D:\REA\os-m-h5c-A.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% h5.c H > D:\REA\os-m-h5c-H.txt 2>&1
%NODE% %D% D:\REA\os-m-h5c-H.txt D:\REA\os-m-h5c-H.utf8.txt
echo m2=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% h5.c I > D:\REA\os-m-h5c-I.txt 2>&1
%NODE% %D% D:\REA\os-m-h5c-I.txt D:\REA\os-m-h5c-I.utf8.txt
echo m3=%ERRORLEVEL%
echo ALLDONE
