@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% N2.m > D:\REA\os-class-N2m.txt 2>&1
%NODE% %D% D:\REA\os-class-N2m.txt D:\REA\os-class-N2m.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% N2.g > D:\REA\os-class-N2g.txt 2>&1
%NODE% %D% D:\REA\os-class-N2g.txt D:\REA\os-class-N2g.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% N2.p > D:\REA\os-class-N2p.txt 2>&1
%NODE% %D% D:\REA\os-class-N2p.txt D:\REA\os-class-N2p.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% N2.b > D:\REA\os-class-N2b.txt 2>&1
%NODE% %D% D:\REA\os-class-N2b.txt D:\REA\os-class-N2b.utf8.txt
echo c4=%ERRORLEVEL%
%NODE% %REA% search-android-classes %APK% Server > D:\REA\os-Server.txt 2>&1
%NODE% %D% D:\REA\os-Server.txt D:\REA\os-Server.utf8.txt
echo s1=%ERRORLEVEL%
%NODE% %REA% search-android-classes %APK% Result > D:\REA\os-Result.txt 2>&1
%NODE% %D% D:\REA\os-Result.txt D:\REA\os-Result.utf8.txt
echo s2=%ERRORLEVEL%
echo ALLDONE
