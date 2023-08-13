@echo off
setlocal enabledelayedexpansion

set /p "tags=Enter tags (separated by spaces): "

rem Split input into an array
set "inputArray="
for %%i in (%tags%) do (
    set "inputArray=!inputArray!"%%i","
)
set "tagArray=[%inputArray:~0,-1%]"



for /f %%a in ('wmic path Win32_VideoController get CurrentHorizontalResolution^,CurrentVerticalResolution /format:value ^| find "="') do (
    set "%%a"
)

set "x=!CurrentHorizontalResolution!"
set "y=!CurrentVerticalResolution!"



set /p "fetches=Fetch ammount(duplicates are being removed): "





echo ^{>settings.json
echo ^"tags^": %tagArray%,>>settings.json
echo ^"x^": %x%,>>settings.json
echo ^"y^": %y%,>>settings.json
echo ^"fetches^": %fetches%>>settings.json
echo ^}>>settings.json

endlocal

set /p "keepoldFiles=Keep old files(type: yes/no) "

if "%keepoldFiles%" == "no" goto delMk

mkdir images
goto mkDone
:delMk
del images /F /Q && mkdir images
:mkDone

node index.js
cd ./images
start .

exit