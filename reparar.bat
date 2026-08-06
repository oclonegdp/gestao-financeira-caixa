@echo off
chcp 65001 >nul
echo [ARQUITETURA] Iniciando limpeza total e reinstalacao de dependencias...

cd /d "%~dp0"

echo [1/4] Removendo pastas corrompidas...
if exist node_modules rd /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist bun.lock del /f /q bun.lock

echo [2/4] Limpando cache do gerenciador...
npm cache clean --force 2>nul
echo Cache limpo.

echo [3/4] Reinstalando dependencias limpas...
npm install
if errorlevel 1 (
    echo [ERRO] Instalacao de dependencias falhou.
    pause
    exit /b 1
)

echo [4/4] Executando build de verificacao...
npm run build
if errorlevel 1 (
    echo [ERRO] Build falhou. Verifique as dependencias.
    pause
    exit /b 1
)

echo [SUCESSO] Processo concluido com exito! O sistema esta pronto para deploy.
pause
