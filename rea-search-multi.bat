@echo off
setlocal enabledelayedexpansion
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
for %%q in (Member member Vip VIP pay Pay Order order LittleApple Recharge) do (
  D:\REA\nodejs-v24\node.exe D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs search-android-classes %APK% %%q > D:\REA\out-search-%%q.txt 2>&1
  echo %%q EXITCODE=!ERRORLEVEL!
  D:\REA\nodejs-v24\node.exe D:\REA\decode-out2.js D:\REA\out-search-%%q.txt D:\REA\out-search-%%q.utf8.txt
)
