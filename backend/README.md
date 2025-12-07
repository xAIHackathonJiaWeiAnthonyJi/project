# Grok Recruiter Backend

## Setup

1. Install dependencies:
```bash
python3 -m pip install -r requirements.txt
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
# Add your Grok API key to .env
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

