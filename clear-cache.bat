@echo off
echo Clearing Vite cache...
rmdir /s /q .svelte-kit 2>nul
rmdir /s /q node_modules\.vite 2>nul
echo Cache cleared!
echo Starting dev server...
npm run dev
