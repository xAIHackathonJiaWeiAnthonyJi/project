# Grok Recruiter Backend

## Setup

1. Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

2. Create `.env` file with your API credentials:

```bash
# Create .env file with the following variables:

# Grok AI API Configuration
GROK_API_KEY=your_grok_api_key_here

# X (Twitter) API Configuration
# You can use either Bearer Token (recommended) or OAuth 1.0a credentials

# Option 1: Bearer Token (recommended for read-only operations)
X_BEARER_TOKEN=your_x_bearer_token_here

# Option 2: OAuth 1.0a credentials (for full API access)
X_API_KEY=your_x_api_key_here
X_API_SECRET=your_x_api_secret_here
X_ACCESS_TOKEN=your_x_access_token_here
X_ACCESS_TOKEN_SECRET=your_x_access_token_secret_here

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
