# X API Webhooks Setup for GrokReach

## Overview

We use **tweet mentions + webhook DMs** for candidate outreach:
1. Tweet publicly mentioning candidates
2. Ask them to DM if interested
3. Webhook captures their DM responses
4. Follow up with interested candidates

---

## Quick Start

### 1. Install Dependencies
```bash
pip install flask waitress
```

### 2. Start Webhook Server
```bash
cd backend
python3 app/webhooks/dm_webhook_server.py
```

Output:
```
🚀 Starting X Webhook Server on 0.0.0.0:8080
📡 Webhook endpoint: http://0.0.0.0:8080/webhooks
🏥 Health check: http://0.0.0.0:8080/health
💬 View DMs: http://0.0.0.0:8080/dms
```

### 3. Expose via HTTPS (ngrok)
```bash
ngrok http 8080
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.app`)

### 4. Register Webhook with X API
```bash
xurl --auth app /2/webhooks -X POST -d '{
  "url": "https://abc123.ngrok.app/webhooks"
}'
```

### 5. Test Webhook
Visit: `http://localhost:8080/health`

Response:
```json
{
  "status": "online",
  "webhook_active": true,
  "dms_received": 0
}
```

---

## Webhook Endpoints

### `POST /webhooks`
Receives real-time DM events from X API

### `GET /webhooks`
Handles CRC challenge for validation

### `GET /dms`
View all received DMs (debug endpoint)

### `GET /health`
Health check

---

## Sending Outreach

### Test Mode (Dry Run)
```python
from app.services.x_mention_service import send_mentions_batch

results = send_mentions_batch(
    candidates=[...],
    job_title="Senior ML Engineer",
    job_link="https://jobs.grokreach.com/123",
    dry_run=True  # Won't actually tweet
)
```

### Production Mode
```python
results = send_mentions_batch(
    candidates=[...],
    job_title="Senior ML Engineer",
    job_link="https://jobs.grokreach.com/123",
    dry_run=False  # Sends real tweets!
)
```

---

## Webhook Replay (Missed DMs)

If your webhook was down and missed DMs:

```bash
xurl --auth app /2/webhooks/replay -X POST -d '{
  "webhook_id":"YOUR_WEBHOOK_ID",
  "from_date":"202512071100",
  "to_date":"202512071200"
}'
```

---

## Message Flow

1. **System tweets:** "@username Hi! We're hiring an ML Engineer - check it out: [link]. DM us if interested!"
2. **Candidate DMs:** "Yes, interested!"
3. **Webhook captures:** Stores DM in `received_dms` list
4. **System follows up:** (TODO: automated response)

---

## Production Deployment

For production, deploy webhook server to:
- AWS Lambda + API Gateway
- Google Cloud Run
- Railway / Render
- Any server with HTTPS

Update webhook URL after deployment!

---

## Troubleshooting

### Webhook Not Receiving Events
1. Check CRC validation passed
2. Verify HTTPS is working
3. Check X Developer Portal → Webhooks status
4. Force re-validation: `xurl --auth app /2/webhooks/{ID} -X PUT`

### 403 Forbidden on Tweets
- Check app has "Read and write" permissions
- Regenerate access tokens after permission change

---

## Files

- `app/services/x_mention_service.py` - Tweet mention logic
- `app/webhooks/dm_webhook_server.py` - Webhook server
- `app/services/x_outreach_service.py` - Old DM service (deprecated)

