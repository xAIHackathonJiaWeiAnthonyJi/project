# Quick Start Guide - GrokReach

## 🚀 Run Backend (API Server)

### 1. Install Dependencies
```bash
cd backend
python3 -m pip install -r requirements.txt
```

### 2. Set Up Environment Variables
Your `.env` file should have:
```bash
# Grok API (xAI)
XAI_API_KEY=xai-fdtk9Y9LTIssfs4BP8VpqhZxTfqPZnGV7h9tDQK9bg6iVk3JdZ5vCyxTokXWqoF1uhWQf6g5nBkiN7AF

# OpenAI (for embeddings only)
OPENAI_API_KEY=your_openai_key

# X (Twitter) API v2
X_ACCESS_TOKEN=1622425593785491457-k8bEjP30r7spLG4bJCPTiuJ9xMBFcc
X_ACCESS_TOKEN_SECRET=mKEOuqwYa6WrmW6gYs4KY6ztNSlI9RgiVQwh9r4ZQYMVP
X_CONSUMER_KEY=0LtSBELQThZlKyksLJV3PuroB
X_CONSUMER_SECRET=yFMTtknNPWcgbe1JBoaZKZWOzNkxzT5g16x6VIs9e3gio0FsgI
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAACp15wEAAAAA9ZoT5oh7XcY6Ej%2Bi6q1YpWb3kuU%3D7i22GJPtuDeaejYzi9Za0KC8sD0zFvVc4iw9UNVk4cvnaznFCU

# Pinecone
PINECONE_API_KEY=pcsk_LHVYY_8a6NNy66MuQxvqFb51twKce4TJ4is8LcH6Urd5QrA92c9s9vif4RobCkmZkHzuh
```

### 3. Run the Server
```bash
cd backend
python3 -m uvicorn app.main:app --reload
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**API Docs:** http://localhost:8000/docs

---

## 🎨 Run Frontend (UI)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

**Output:**
```
  VITE v5.4.19  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open:** http://localhost:5173

---

## 🧪 Test the X Sourcing Agent

### From Terminal (Direct)
```bash
cd backend
python3 -c "
import asyncio
from app.services.sourcing_agent import SourcingAgent

async def test():
    agent = SourcingAgent()
    result = await agent.run_full_pipeline(
        job_id=3001,
        job_title='Senior ML Engineer',
        job_description='ML engineer with LLM expertise',
        job_link='https://jobs.grokreach.com/ml-3001',
        send_outreach=True,
        dry_run=False  # SEND REAL TWEETS
    )
    print(f'Status: {result[\"status\"]}')
    print(f'Candidates: {result[\"candidates_sourced\"]}')
    print(f'Reached out: {result[\"reach_out_count\"]}')

asyncio.run(test())
"
```

### From API (via curl)
```bash
# Create a job
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior ML Engineer",
    "description": "ML engineer with LLM expertise",
    "headcount": 2
  }'

# Response: {"id": 1, "title": "Senior ML Engineer", ...}
```

---

## 📡 Run Webhook Server (for DM responses)

### Terminal 1: Start Webhook
```bash
cd backend
python3 app/webhooks/dm_webhook_server.py
```

### Terminal 2: Expose via ngrok
```bash
ngrok http 8081
```

### Terminal 3: Register with X
```bash
xurl --auth app /2/webhooks -X POST -d '{
  "url": "https://YOUR-NGROK-URL.ngrok.app/webhooks"
}'
```

### Monitor DMs
```bash
curl http://localhost:8081/dms | python3 -m json.tool
```

---

## 🗂️ Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app
│   │   ├── services/
│   │   │   ├── sourcing_agent.py      # Main X sourcing pipeline
│   │   │   ├── grok_service.py        # Job parsing
│   │   │   ├── x_api_service.py       # X user search
│   │   │   └── x_mention_service.py   # Tweet outreach
│   │   └── webhooks/
│   │       └── dm_webhook_server.py   # DM listener
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AgentControlCenter.tsx  # Main page
    │   │   └── Activity.tsx            # Outreach tracking
    │   └── App.tsx
    └── package.json
```

---

## ✅ Verify Everything Works

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```

### 2. Create Test Job
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job", "description": "Test", "headcount": 1}'
```

### 3. View Jobs
```bash
curl http://localhost:8000/api/jobs
```

### 4. Frontend
Open http://localhost:5173 and you should see the Agent Control Center

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Missing Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Database Errors
```bash
# Delete and recreate
rm grok_recruiter.db
# Restart server (auto-creates DB)
```

### X API 401 Errors
- Check API keys in `.env`
- Regenerate tokens in X Developer Portal
- Verify app has "Read and write" permissions

---

## 📊 Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/{id}` | Get job details |
| GET | `/docs` | API documentation |

---

## 🎯 Next Steps

1. ✅ Run backend: `uvicorn app.main:app --reload`
2. ✅ Run frontend: `npm run dev`
3. ✅ Open http://localhost:5173
4. ✅ Click "X-First Sourcing Agent"
5. ✅ Fill job details and click "Start Agent"
6. 🔜 Connect frontend to backend API (coming next)

