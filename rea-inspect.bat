@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
D:\REA\nodejs-v24\node.exe D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs inspect-android-package D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk > D:\REA\out-inspect-package.txt 2>&1
echo EXITCODE=%ERRORLEVEL%
