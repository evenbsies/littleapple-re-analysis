@echo off
set "PATH=D:\REA\nodejs-v24;%PATH%"
set "npm_config_prefix=D:\REA\runtime"
npm install --global rea-agents@6.5.0
echo INSTALL_EXIT %ERRORLEVEL%
dir D:\REA\runtime\node_modules\rea-agents\scripts
