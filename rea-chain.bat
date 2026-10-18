@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe

%NODE% %REA% search-android-classes %APK% MembershipDialog > D:\REA\out-search-MembershipDialog.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-search-MembershipDialog.txt D:\REA\out-search-MembershipDialog.utf8.txt
echo s1=%ERRORLEVEL%

%NODE% %REA% search-android-classes %APK% MembershipOrder > D:\REA\out-search-MembershipOrder.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-search-MembershipOrder.txt D:\REA\out-search-MembershipOrder.utf8.txt
echo s2=%ERRORLEVEL%

%NODE% %REA% search-android-classes %APK% AccessDecision > D:\REA\out-search-AccessDecision.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-search-AccessDecision.txt D:\REA\out-search-AccessDecision.utf8.txt
echo s3=%ERRORLEVEL%

%NODE% %REA% trace-android-references %APK% com.fongmi.android.tv.auth.NativeAuth > D:\REA\out-trace-NativeAuth.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-trace-NativeAuth.txt D:\REA\out-trace-NativeAuth.utf8.txt
echo s4=%ERRORLEVEL%

%NODE% %REA% inspect-android-method %APK% com.fongmi.android.tv.auth.NativeAuth verifyResponse > D:\REA\out-method-verifyResponse.txt 2>&1
%NODE% D:\REA\decode-out2.js D:\REA\out-method-verifyResponse.txt D:\REA\out-method-verifyResponse.utf8.txt
echo s5=%ERRORLEVEL%
