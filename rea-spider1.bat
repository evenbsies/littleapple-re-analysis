@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% search-android-classes %APK% Spider > D:\REA\os-Spider.txt 2>&1
%NODE% %D% D:\REA\os-Spider.txt D:\REA\os-Spider.utf8.txt
echo s1=%ERRORLEVEL%
%NODE% %REA% search-android-classes %APK% QuickJS > D:\REA\os-QuickJS.txt 2>&1
%NODE% %D% D:\REA\os-QuickJS.txt D:\REA\os-QuickJS.utf8.txt
echo s2=%ERRORLEVEL%
%NODE% %REA% search-android-classes %APK% catvod > D:\REA\os-catvod.txt 2>&1
%NODE% %D% D:\REA\os-catvod.txt D:\REA\os-catvod.utf8.txt
echo s3=%ERRORLEVEL%
%NODE% %REA% search-android-classes %APK% bean > D:\REA\os-bean.txt 2>&1
%NODE% %D% D:\REA\os-bean.txt D:\REA\os-bean.utf8.txt
echo s4=%ERRORLEVEL%
echo ALLDONE
