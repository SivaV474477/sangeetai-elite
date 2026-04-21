#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SangeetAI Elite — Setup Script
# Run once to install all dependencies and configure your environment.
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

GOLD='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GOLD}  ╔══════════════════════════════════════╗${NC}"
echo -e "${GOLD}  ║       SangeetAI Elite Setup          ║${NC}"
echo -e "${GOLD}  ╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Node / npm ─────────────────────────────────────────────────────────
echo -e "${GOLD}[1/4] Checking Node.js...${NC}"
if ! command -v node &>/dev/null; then
  echo -e "${RED}  ✗ Node.js not found. Install from https://nodejs.org (v18+)${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}  ✓ Node.js $NODE_VER found${NC}"

# ── 2. Install frontend deps ───────────────────────────────────────────────
echo -e "${GOLD}[2/4] Installing React frontend dependencies...${NC}"
npm install
echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"

# ── 3. Python / pip ────────────────────────────────────────────────────────
echo -e "${GOLD}[3/4] Setting up Python backend...${NC}"
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}  ✗ Python 3 not found. Install from https://python.org (v3.10+)${NC}"
  echo "     Skipping backend setup. Frontend will run in browser-only mode."
else
  PYTHON_VER=$(python3 --version)
  echo -e "${GREEN}  ✓ $PYTHON_VER found${NC}"

  echo "  Creating virtual environment at ./backend/.venv ..."
  python3 -m venv backend/.venv
  source backend/.venv/bin/activate
  pip install --quiet --upgrade pip
  pip install --quiet -r backend/requirements.txt
  deactivate
  echo -e "${GREEN}  ✓ Python backend dependencies installed${NC}"
fi

# ── 4. API Key ─────────────────────────────────────────────────────────────
echo -e "${GOLD}[4/4] Configuring API key...${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo -e "${RED}  ⚠  Action required:${NC}"
  echo "     Open .env and replace 'your_anthropic_api_key_here' with your real key."
  echo "     Get your key at: https://console.anthropic.com/"
  echo ""
else
  echo -e "${GREEN}  ✓ .env already exists${NC}"
fi

# ── Done ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GOLD}  ════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Setup complete!${NC}"
echo ""
echo "  To START the app, open two terminals:"
echo ""
echo -e "  ${GOLD}Terminal 1 (Frontend):${NC}"
echo "    npm start"
echo ""
echo -e "  ${GOLD}Terminal 2 (Backend — optional but recommended):${NC}"
echo "    source backend/.venv/bin/activate"
echo "    uvicorn backend.main:app --reload --port 8000"
echo ""
echo "  Then open: http://localhost:3000"
echo -e "${GOLD}  ════════════════════════════════════════${NC}"
echo ""
