@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% h5.c > D:\REA\os-class-h5c.txt 2>&1
%NODE% %D% D:\REA\os-class-h5c.txt D:\REA\os-class-h5c.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.fongmi.android.tv.bean.H > D:\REA\os-class-beanH.txt 2>&1
%NODE% %D% D:\REA\os-class-beanH.txt D:\REA\os-class-beanH.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.p h > D:\REA\os-m-N2p-h.txt 2>&1
%NODE% %D% D:\REA\os-m-N2p-h.txt D:\REA\os-m-N2p-h.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% N2.p d > D:\REA\os-m-N2p-d.txt 2>&1
%NODE% %D% D:\REA\os-m-N2p-d.txt D:\REA\os-m-N2p-d.utf8.txt
echo m2=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% N2.p > D:\REA\os-trace-N2p.txt 2>&1
%NODE% %D% D:\REA\os-trace-N2p.txt D:\REA\os-trace-N2p.utf8.txt
echo t1=%ERRORLEVEL%
echo ALLDONE
