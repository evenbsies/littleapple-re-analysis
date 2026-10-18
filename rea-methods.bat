@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-method %APK% G2.j a > D:\REA\out-m-G2j-a.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-a.txt D:\REA\out-m-G2j-a.utf8.txt
%NODE% %REA% inspect-android-method %APK% G2.j z > D:\REA\out-m-G2j-z.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-z.txt D:\REA\out-m-G2j-z.utf8.txt
%NODE% %REA% inspect-android-method %APK% G2.j L > D:\REA\out-m-G2j-L.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-L.txt D:\REA\out-m-G2j-L.utf8.txt
%NODE% %REA% inspect-android-method %APK% G2.j I > D:\REA\out-m-G2j-I.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-I.txt D:\REA\out-m-G2j-I.utf8.txt
%NODE% %REA% inspect-android-method %APK% G2.j J > D:\REA\out-m-G2j-J.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-J.txt D:\REA\out-m-G2j-J.utf8.txt
%NODE% %REA% inspect-android-method %APK% G2.j e > D:\REA\out-m-G2j-e.txt 2>&1
%NODE% %D% D:\REA\out-m-G2j-e.txt D:\REA\out-m-G2j-e.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h l > D:\REA\out-m-f3h-l.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-l.txt D:\REA\out-m-f3h-l.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h f > D:\REA\out-m-f3h-f.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-f.txt D:\REA\out-m-f3h-f.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h j > D:\REA\out-m-f3h-j.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-j.txt D:\REA\out-m-f3h-j.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h t > D:\REA\out-m-f3h-t.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-t.txt D:\REA\out-m-f3h-t.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h r > D:\REA\out-m-f3h-r.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-r.txt D:\REA\out-m-f3h-r.utf8.txt
%NODE% %REA% inspect-android-method %APK% f3.h q > D:\REA\out-m-f3h-q.txt 2>&1
%NODE% %D% D:\REA\out-m-f3h-q.txt D:\REA\out-m-f3h-q.utf8.txt
echo ALLDONE
