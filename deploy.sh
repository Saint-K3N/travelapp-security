#!/bin/bash

echo "========================================"
echo "Firebase Hosting Deployment Script"
echo "Travel Companion App"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[Step 1/6] Checking Firebase CLI installation...${NC}"
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "Firebase CLI is already installed"
fi
echo ""

echo -e "${GREEN}[Step 2/6] Checking environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}WARNING: .env.local file not found!${NC}"
    echo "Please create .env.local file with your API keys"
    echo "Copy .env.local.template and fill in your actual values"
    exit 1
else
    echo ".env.local file found"
fi
echo ""

echo -e "${GREEN}[Step 3/6] Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}[Step 4/6] Building production version...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Build failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}[Step 5/6] Checking Firebase login status...${NC}"
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "You need to login to Firebase"
    firebase login
fi
echo ""

echo -e "${GREEN}[Step 6/6] Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Deployment failed${NC}"
    exit 1
fi
echo ""

echo "========================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "Your app is now live at:"
echo -e "${YELLOW}https://travelapp-security.web.app${NC}"
echo -e "${YELLOW}https://travelapp-security.firebaseapp.com${NC}"
echo ""