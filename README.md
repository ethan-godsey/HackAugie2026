# HackAugie2026
Our 24-hour hackathon project

# ParityCheck

Fight mental health insurance claim denials using federal parity law (MHPAEA).

## Quick start

```bash
# Install root deps
npm install

# Server
cd server && npm install
cp .env.example .env        # add ANTHROPIC_API_KEY

# Client
cd ../client && npm install

# Run both
cd .. && npm run dev
```

Frontend: http://localhost:5173  
Backend:  http://localhost:3001

## Team ownership

| Person | Files |
|--------|-------|
| Person 1 (Backend) | server/index.js, server/services/*, server/routes/* |
| Person 2 (Frontend) | client/src/pages/*, client/src/index.css |
| Person 3 (Data+Pitch) | server/data/cptDatabase.js, pitch deck, demo scenarios |

## Demo flow for judges

1. CPT 90837 + "Not medically necessary" + PPO → RED verdict
2. Fill patient details → appeal letter in ~5 seconds  
3. Save → tracker dashboard shows status timeline
