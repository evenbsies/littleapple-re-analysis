@echo off
set REA_JADX_MCP_JAR=D:\REA\android\jadx-headless-mcp-0.7.1-all.jar
set JAVA_HOME=C:\Program Files\Java\jdk-17
set REA_JADX_OPERATION_TIMEOUT_MS=600000
set PATH=%JAVA_HOME%\bin;%PATH%
set APK=D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk
set REA=D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs
set NODE=D:\REA\nodejs-v24\node.exe
set D=D:\REA\decode-out2.js

%NODE% %REA% inspect-android-method %APK% com.fongmi.android.tv.bean.H Q > D:\REA\os-m-beanH-Q.txt 2>&1
%NODE% %D% D:\REA\os-m-beanH-Q.txt D:\REA\os-m-beanH-Q.utf8.txt
echo m1=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% com.fongmi.android.tv.bean.H > D:\REA\os-class-beanH2.txt 2>&1
%NODE% %D% D:\REA\os-class-beanH2.txt D:\REA\os-class-beanH2.utf8.txt
echo c1=%ERRORLEVEL%
%NODE% %REA% inspect-android-method %APK% com.fongmi.android.tv.bean.H C > D:\REA\os-m-beanH-C.txt 2>&1
%NODE% %D% D:\REA\os-m-beanH-C.txt D:\REA\os-m-beanH-C.utf8.txt
echo m2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% O2.s > D:\REA\os-class-O2s.txt 2>&1
%NODE% %D% D:\REA\os-class-O2s.txt D:\REA\os-class-O2s.utf8.txt
echo c2=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% a3.d > D:\REA\os-class-a3d.txt 2>&1
%NODE% %D% D:\REA\os-class-a3d.txt D:\REA\os-class-a3d.utf8.txt
echo c3=%ERRORLEVEL%
%NODE% %REA% inspect-android-class %APK% G2.b0 > D:\REA\os-class-G2b0.txt 2>&1
%NODE% %D% D:\REA\os-class-G2b0.txt D:\REA\os-class-G2b0.utf8.txt
echo c4=%ERRORLEVEL%
%NODE% %REA% trace-android-references %APK% com.fongmi.android.tv.bean.F > D:\REA\os-trace-beanF.txt 2>&1
%NODE% %D% D:\REA\os-trace-beanF.txt D:\REA\os-trace-beanF.utf8.txt
echo t1=%ERRORLEVEL%
echo ALLDONE
