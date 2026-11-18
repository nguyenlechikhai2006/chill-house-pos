@echo off
chcp 65001 > nul
echo ========================================================
echo   DANG DAY CODE CHILL HOUSE POS LEN CA 2 GITHUB:
echo   1. webthuctapp/quan-li-cafe
echo   2. nguyenlechikhai2006/chill-house-pos
echo ========================================================
cd /d "%~dp0"
git add .
git commit -m "update: dong bo code chill house pos"
git push origin main
echo.
if %errorlevel% equ 0 (
    echo [THANH CONG] Code da duoc dong bo len ca 2 tai khoan GitHub!
) else (
    echo [LUU Y] Co loi xay ra hoac chua co commit moi.
)
pause
