@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-class %APK% com.github.catvod.crawler.Spider > D:\REA\os-class-Spider.txt 2>&1
%NODE% %D% D:\REA\os-class-Spider.txt D:\REA\os-class-Spider.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.github.catvod.crawler.SpiderNull > D:\REA\os-class-SpiderNull.txt 2>&1
%NODE% %D% D:\REA\os-class-SpiderNull.txt D:\REA\os-class-SpiderNull.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.github.catvod.crawler.SpiderDebug > D:\REA\os-class-SpiderDebug.txt 2>&1
%NODE% %D% D:\REA\os-class-SpiderDebug.txt D:\REA\os-class-SpiderDebug.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.github.catvod.crawler.R > D:\REA\os-class-crawlerR.txt 2>&1
%NODE% %D% D:\REA\os-class-crawlerR.txt D:\REA\os-class-crawlerR.utf8.txt
echo c4=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.github.catvod.Proxy > D:\REA\os-class-Proxy.txt 2>&1
%NODE% %D% D:\REA\os-class-Proxy.txt D:\REA\os-class-Proxy.utf8.txt
echo c5=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% com.github.catvod.crawler.Spider > D:\REA\os-trace-Spider.txt 2>&1
%NODE% %D% D:\REA\os-trace-Spider.txt D:\REA\os-trace-Spider.utf8.txt
echo t1=%ERRORLEVEL%
echo ALLDONE
