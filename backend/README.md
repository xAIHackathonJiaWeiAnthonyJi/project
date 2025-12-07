# Grok Recruiter Backend

## Setup

1. Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

2. Create `.env` file with your X API credentials:

```bash
# X API Bearer Token (for reading user data)
X_BEARER_TOKEN=your_bearer_token_here

# X API OAuth 1.0a credentials (for sending messages)
X_CONSUMER_KEY=your_consumer_key_here
X_CONSUMER_SECRET=your_consumer_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# Database Configuration
DATABASE_URL=sqlite:///./recruiter.db

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

3. Run the server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Jobs

- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get a specific job

### Messages (X/Twitter Direct Messages)

- `GET /api/messages/health` - Check if X API credentials are configured
- `POST /api/messages/send` - Send a direct message to a user
- `POST /api/messages/send-recruitment` - Send a professional recruitment message

### Example: Create a Job

```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "description": "We need an experienced Python developer...",
    "headcount": 2
  }'
```

## Database

SQLite database file: `grok_recruiter.db` (auto-created on first run)
