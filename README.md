# HackAugie2026
Our 24-hour hackathon project

# Appeally

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

## Demo flow for judges

1. CPT 90837 + "Not medically necessary" + PPO → RED verdict
2. Fill patient details → appeal letter in ~5 seconds  
3. Download to upload or send to the insurance → my appeals shows all the appeal letters if logged in.
