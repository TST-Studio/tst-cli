@echo off
REM Use tsx via Node's --import (Node >= 20.6)
node --import tsx "%~dp0\dev.js" %*
