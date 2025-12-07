# 🧪 Webhook Testing Guide - Step by Step

## ✅ Stage 1: Local Testing (COMPLETE)

You've already verified:
- ✅ Webhook server runs on port 8081
- ✅ CRC challenge works
- ✅ DM events are received and stored
- ✅ Health check works

---

## 🌐 Stage 2: Connect to Real X API

### Step 1: Install ngrok (if not installed)
```bash
brew install ngrok
# or download from https://ngrok.com/download
```

### Step 2: Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_NGROK_TOKEN
```
Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Start ngrok tunnel
```bash
ngrok http 8081
```

You'll see output like:
```
Forwarding  https://abc123xyz.ngrok.app -> http://localhost:8081
```

**Copy that HTTPS URL!** (e.g., `https://abc123xyz.ngrok.app`)

### Step 4: Register Webhook with X
```bash
xurl --auth app /2/webhooks -X POST -d '{
  "url": "https://abc123xyz.ngrok.app/webhooks"
}'
```

Expected response:
```json
{
  "data": {
    "id": "1146654567674912769",
    "url": "https://abc123xyz.ngrok.app/webhooks",
    "valid": true
  }
}
```

### Step 5: Verify Webhook Registration
```bash
xurl --auth app /2/webhooks
```

Should show your webhook with `"valid": true`

---

## 📨 Stage 3: Test with Real Candidate Response

### Option A: Have Someone DM Your Account
1. Ask a friend to DM your X account
2. Check webhook received it: `curl http://localhost:8081/dms`

### Option B: Test with Your Own Account
1. From another X account, send a DM to your account
2. Webhook should capture it immediately

---

## 🔍 Monitor Webhook Activity

### View Received DMs
```bash
curl http://localhost:8081/dms | python3 -m json.tool
```

### Watch ngrok Traffic
```bash
# Visit: http://127.0.0.1:4040
# ngrok web interface shows all requests
```

### Check Webhook Server Logs
```bash
tail -f /tmp/webhook.log
```

---

## 🧪 Quick Test Commands

### 1. Check Server Health
```bash
curl http://localhost:8081/health
```

### 2. Simulate CRC Challenge
```bash
curl "http://localhost:8081/webhooks?crc_token=test_token"
```

### 3. Simulate DM Event
```bash
curl -X POST http://localhost:8081/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "direct_message_events": [{
      "message_create": {
        "sender_id": "123",
        "message_data": {"text": "I am interested!"}
      }
    }],
    "users": {
      "123": {
        "screen_name": "test_user",
        "name": "Test User"
      }
    }
  }'
```

### 4. View All Received DMs
```bash
curl http://localhost:8081/dms | python3 -m json.tool
```

---

## 🚀 Complete Outreach + Webhook Flow

### Full Test Scenario

**Terminal 1: Start Webhook**
```bash
cd backend
python3 app/webhooks/dm_webhook_server.py
```

**Terminal 2: Start ngrok**
```bash
ngrok http 8081
```

**Terminal 3: Register Webhook**
```bash
xurl --auth app /2/webhooks -X POST -d '{
  "url": "https://YOUR-NGROK-URL/webhooks"
}'
```

**Terminal 4: Run Sourcing Pipeline + Send Tweets**
```bash
cd backend
python3 -c "
import asyncio
from app.services.sourcing_agent import SourcingAgent

async def run():
    agent = SourcingAgent()
    await agent.run_full_pipeline(
        job_id=3001,
        job_title='Senior ML Engineer',
        job_description='ML engineer with LLM expertise',
        job_link='https://jobs.grokreach.com/ml-3001',
        send_outreach=True,
        dry_run=False  # SEND REAL TWEETS
    )

asyncio.run(run())
"
```

**Terminal 5: Monitor Responses**
```bash
watch -n 2 'curl -s http://localhost:8081/dms | python3 -m json.tool'
```

---

## ⚠️ Troubleshooting

### Webhook Returns 401/403
- Check X_CONSUMER_SECRET is correct in .env
- Verify webhook was registered successfully

### No DMs Received
- Check ngrok is still running
- Verify webhook status: `xurl --auth app /2/webhooks`
- Force re-validation: `xurl --auth app /2/webhooks/{WEBHOOK_ID} -X PUT`

### CRC Challenge Fails
- Check CONSUMER_SECRET matches your X app
- Verify HTTPS is working (ngrok)

---

## 🎯 Expected Flow

1. ✅ Pipeline finds candidates
2. ✅ System tweets: "@username Hi! Interested in this role? DM us!"
3. ⏳ Candidate sees tweet
4. ⏳ Candidate sends DM: "Yes, interested!"
5. ✅ Webhook captures DM
6. ✅ System stores response
7. 🔜 System follows up (TODO: automated response)

---

**Current Status:** Webhook server tested locally ✅  
**Next:** Expose via ngrok and register with X API

