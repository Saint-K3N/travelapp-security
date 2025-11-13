@echo off
echo ========================================
echo Firebase Hosting Deployment Script
echo Travel Companion App
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [Step 1/6] Checking Firebase CLI installation...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
) else (
    echo Firebase CLI is already installed
)
echo.

echo [Step 2/6] Checking environment variables...
if not exist ".env.local" (
    echo WARNING: .env.local file not found!
    echo Please create .env.local file with your API keys
    echo Copy .env.local.template and fill in your actual values
    pause
    exit /b 1
) else (
    echo .env.local file found
)
echo.

echo [Step 3/6] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [Step 4/6] Building production version...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [Step 5/6] Checking Firebase login status...
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo You need to login to Firebase
    firebase login
)
echo.

echo [Step 6/6] Deploying to Firebase Hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your app is now live at:
echo https://travelapp-security.web.app
echo https://travelapp-security.firebaseapp.com
echo.
echo Press any key to exit...
pause >nul