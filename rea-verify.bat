@echo off
set "NODE_OPTIONS=--max-old-space-size=2048"
echo {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"verify-client","version":"1.0"}}} | D:\REA\nodejs-v24\node.exe D:\REA\runtime\node_modules\rea-agents\scripts\rea.mjs mcp
echo MCP_EXIT %ERRORLEVEL%
