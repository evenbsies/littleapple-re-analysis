@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
D:\REA\nodejs-v24\node.exe D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs search-android-classes D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk auth > D:\REA\out-search-auth.txt 2>&1
echo EXITCODE=%ERRORLEVEL%
cmd /u /c D:\REA\nodejs-v24\node.exe D:\REA\decode-out2.js D:\REA\out-search-auth.txt D:\REA\out-search-auth.utf8.txt
