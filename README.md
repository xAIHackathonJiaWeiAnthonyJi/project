# 🤖 Grok Recruiter

> AI-powered recruiting automation platform that replaces manual recruiting workflows with intelligent agents while preserving human oversight and continuous learning.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)

---

## 📖 Overview

**Grok Recruiter** is an AI-powered recruiting automation platform that transforms traditional manual recruiting processes into an intelligent, automated workflow. The system leverages AI agents to handle candidate sourcing, resume screening, interview evaluation, and team matching while maintaining human oversight and learning from real hiring outcomes.

### 🎯 Key Features

- **🔍 Intelligent Candidate Sourcing** - AI-powered discovery from X (Twitter) and GitHub using semantic search and behavioral signals
- **📊 Automated Resume Screening** - AI scoring and routing with transparent reasoning
- **🎤 Interview Evaluation** - Automated interview assessment with Grok-powered analysis
- **🧠 Adaptive Learning** - Reinforcement learning-inspired system that improves from hiring outcomes
- **👥 Team Matching** - AI-driven candidate-team compatibility analysis
- **📈 Real-time Dashboard** - Complete visibility into AI decisions with override controls
- **🔄 Feedback Loop** - Continuous improvement through outcome tracking and threshold optimization
- **🎯 Pipeline Integration** - End-to-end automation from sourcing to offer

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Backend Setup**
```bash
cd backend

# Install dependencies
python3 -m pip install -r requirements.txt

# Create .env file with your credentials
cat > .env << EOF
# Grok API (xAI)
XAI_API_KEY=your_xai_api_key_here

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_key_here

# X (Twitter) API v2
X_ACCESS_TOKEN=your_x_access_token
X_ACCESS_TOKEN_SECRET=your_x_access_token_secret
X_CONSUMER_KEY=your_x_consumer_key
X_CONSUMER_SECRET=your_x_consumer_secret
X_BEARER_TOKEN=your_x_bearer_token

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
EOF

# Run database migrations
python migrate_adaptive_learning.py

# Start the server
uvicorn app.main:app --reload
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Grok Recruiter System                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌─────────┐  │
│  │   Frontend   │─────▶│   Backend    │─────▶│  Grok   │  │
│  │ React + TS   │      │   FastAPI    │      │   AI    │  │
│  └──────────────┘      └──────────────┘      └─────────┘  │
│         │                      │                     │      │
│         │                      │                     │      │
│         ▼                      ▼                     ▼      │
│  ┌──────────────┐      ┌──────────────┐      ┌─────────┐  │
│  │  Dashboard   │      │   SQLite     │      │   X API │  │
│  │   & Control  │      │   Database   │      │Pinecone │  │
│  └──────────────┘      └──────────────┘      └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - Database ORM with Pydantic integration
- **SQLite** - Lightweight database for MVP
- **Grok AI** - Primary LLM for all AI operations
- **OpenAI** - Embeddings generation
- **Pinecone** - Vector database for semantic search
- **Tweepy** - X (Twitter) API integration

#### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **shadcn/ui** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Recharts** - Data visualization

---

## 🎯 Core Features

### 1. Intelligent Sourcing Agent

The sourcing agent uses a sophisticated 7-step pipeline to discover and rank candidates:

1. **Job → Embedding** - Semantic representation of job requirements
2. **Embedding → Topics** - AI-generated search topics from job description
3. **Topics → X Users** - Discovery of active users discussing relevant topics
4. **X Users → Role Verification** - AI-powered developer classification
5. **Experience Validation** - LinkedIn profile analysis (with mock data for demo)
6. **AI Compatibility Scoring** - Deep job-candidate fit analysis
7. **Ranking & Pipeline Insertion** - Sorted shortlist of qualified candidates

```bash
# Run sourcing agent
cd backend
python test_full_sourcing.py
```

### 2. Adaptive Learning System

Reinforcement learning-inspired system that continuously improves from hiring outcomes:

- **Outcome Tracking** - Records actual hiring results and performance
- **Threshold Optimization** - Automatically adjusts decision thresholds
- **Metrics Dashboard** - Real-time accuracy, precision, and improvement tracking
- **Learning Simulation** - Demo mode to visualize learning progress

```bash
# Run adaptive learning demo
cd backend
python test_adaptive_learning.py
```

### 3. Interview Evaluation

AI-powered interview assessment with:

- **Automated Scoring** - Grok-based evaluation of interview responses
- **Dispatch Management** - Schedule and track phone screens
- **Performance Analytics** - Track interviewer and candidate metrics
- **Review Interface** - Human review and override capabilities

### 4. Team Matching

Intelligent candidate-team compatibility analysis:

- **Team Profiles** - Technical stack and culture representation
- **Match Scoring** - AI-powered compatibility analysis
- **Manager Notifications** - Automated team matching alerts
- **Feedback Integration** - Learn from placement outcomes

---

## 📚 API Documentation

### Core Endpoints

#### Jobs
```bash
# Create a job
POST /api/jobs
{
  "title": "Senior Backend Engineer",
  "description": "We need an experienced Python developer...",
  "headcount": 2
}

# List all jobs
GET /api/jobs

# Get job details
GET /api/jobs/{job_id}

# Get job candidates
GET /api/jobs/{job_id}/candidates
```

#### Candidates
```bash
# List all candidates
GET /api/candidates

# Get candidate details
GET /api/candidates/{candidate_id}

# Update candidate stage
PUT /api/candidates/{candidate_id}/stage
{
  "stage": "interview",
  "notes": "Strong technical background"
}
```

#### Sourcing
```bash
# Start sourcing agent
POST /api/sourcing/run
{
  "job_id": 1,
  "send_outreach": true,
  "max_candidates": 50
}

# Get sourcing status
GET /api/sourcing/status/{job_id}
```

#### Learning
```bash
# Record outcome
POST /api/learning/outcomes
{
  "candidate_id": 123,
  "outcome": "hired",
  "performance_rating": 5,
  "retained_3_months": true
}

# Get learning metrics
GET /api/learning/metrics

# Run simulation
POST /api/learning/simulate
{
  "num_iterations": 100
}
```

#### Interviews
```bash
# Dispatch interview
POST /api/interviews/dispatch
{
  "candidate_id": 123,
  "job_id": 1,
  "phone_number": "+1234567890"
}

# Get interview results
GET /api/interviews/{interview_id}

# List all interviews
GET /api/interviews
```

Full API documentation available at: http://localhost:8000/docs

---

## 🎨 Frontend Pages

### Dashboard
- **Stats Overview** - Active jobs, candidates, interviews
- **Job Cards** - Quick access to job pipelines
- **Activity Feed** - Recent AI actions and decisions

### Agent Control Center
- **Sourcing Control** - Configure and launch sourcing agents
- **Pipeline Management** - Monitor active sourcing runs
- **Outreach Tracking** - View X engagement metrics

### Candidates
- **Pipeline View** - Kanban-style candidate flow
- **Candidate Details** - Complete profile with AI reasoning
- **Outcome Feedback** - Record hiring results for learning

### Interviews
- **Interview List** - All scheduled and completed interviews
- **Dispatch Modal** - Schedule new phone screens
- **Review Interface** - Evaluate interview performance

### Learning Dashboard
- **Accuracy Metrics** - Real-time system performance
- **Threshold Evolution** - Visualize parameter updates
- **Precision Tracking** - Per-stage success rates
- **Simulation Runner** - Interactive learning demo

### Team Matches
- **Match Scores** - AI-powered team compatibility
- **Team Profiles** - Technical and cultural fit data
- **Placement Tracking** - Monitor team assignments

---

## 🎮 Demo Walkthrough

### 1. Create a Job
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior ML Engineer",
    "description": "Looking for an ML engineer with LLM expertise",
    "headcount": 2
  }'
```

### 2. Run Sourcing Agent
Navigate to **Agent Control Center** → Enter job details → Click **Start Agent**

Or via API:
```bash
curl -X POST http://localhost:8000/api/sourcing/run \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": 1,
    "send_outreach": true
  }'
```

### 3. View Candidates
Navigate to **Dashboard** → Click on job card → View sourced candidates with AI scores

### 4. Override AI Decision
Click on a candidate → Review AI reasoning → Click **Override** → Provide feedback

### 5. Track Learning
Navigate to **Learning Dashboard** → View accuracy improvements → Run simulation

---

## 🧪 Testing

### Run Full Pipeline Test
```bash
cd backend
python test_full_sourcing.py
```

### Run Adaptive Learning Test
```bash
cd backend
python test_adaptive_learning.py
```

### Run Interview Agent Test
```bash
cd backend
python test_interview_agent.py
```

### Individual Component Tests
```bash
cd backend/tests

# Test embedding generation
python test_step1_embedding.py

# Test topic extraction
python test_step2_topics.py

# Test X search
python test_step3_x_search.py

# Test role verification
python test_step4_role_verification.py

# Test full pipeline
python test_full_pipeline.py
```

---

## 🗂️ Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # API endpoints
│   │   │       ├── auth.py
│   │   │       ├── candidates.py
│   │   │       ├── interviews.py
│   │   │       ├── jobs.py
│   │   │       ├── learning.py
│   │   │       ├── sourcing.py
│   │   │       └── teams.py
│   │   ├── models/
│   │   │   └── schemas.py       # Database models
│   │   ├── services/            # Business logic
│   │   │   ├── adaptive_learning_service.py
│   │   │   ├── sourcing_agent.py
│   │   │   ├── interview_service.py
│   │   │   ├── team_match_service.py
│   │   │   ├── grok_service.py
│   │   │   └── x_api_service.py
│   │   ├── db/
│   │   │   └── database.py      # Database connection
│   │   └── main.py              # FastAPI app
│   ├── tests/                   # Integration tests
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AgentControlCenter.tsx
│   │   │   ├── Candidates.tsx
│   │   │   ├── Interviews.tsx
│   │   │   ├── AdaptiveLearning.tsx
│   │   │   └── Teams.tsx
│   │   ├── components/          # Reusable components
│   │   │   ├── dashboard/
│   │   │   ├── candidates/
│   │   │   ├── interviews/
│   │   │   ├── sourcing/
│   │   │   └── ui/              # shadcn components
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   └── App.tsx              # Main app component
│   ├── package.json             # Node dependencies
│   └── vite.config.ts           # Vite configuration
│
└── docs/
    ├── PROJECT_CONTEXT.md       # System overview
    ├── QUICK_START.md           # Setup guide
    ├── ADAPTIVE_LEARNING_README.md
    ├── SOURCING_AGENT_SPEC.md
    └── INTERVIEW_AGENT_SPEC.md
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Grok API (xAI)
XAI_API_KEY=your_xai_api_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# X (Twitter) API
X_ACCESS_TOKEN=your_x_access_token
X_ACCESS_TOKEN_SECRET=your_x_access_token_secret
X_CONSUMER_KEY=your_x_consumer_key
X_CONSUMER_SECRET=your_x_consumer_secret
X_BEARER_TOKEN=your_x_bearer_token

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key

# Database (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./grok_recruiter.db

# Application
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### API Keys Setup

1. **Grok AI (xAI)**: Get API key from [x.ai](https://x.ai)
2. **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com)
3. **X (Twitter)**: Create app at [X Developer Portal](https://developer.x.com)
4. **Pinecone**: Create account at [Pinecone](https://www.pinecone.io)

---

## 📊 Key Metrics & Analytics

The system tracks comprehensive metrics for continuous improvement:

### Sourcing Metrics
- Candidates sourced per job
- X engagement rates
- Response rates
- Time to source

### Screening Metrics
- AI accuracy vs human decisions
- Override frequency and reasons
- Score distribution
- Pass-through rates per stage

### Learning Metrics
- Overall accuracy trend
- Precision per stage (sourcing, screening, interview)
- Threshold evolution
- Improvement velocity

### Interview Metrics
- Interview completion rate
- Average interview duration
- Interviewer feedback scores
- Candidate experience ratings

### Team Matching Metrics
- Match score distribution
- Placement success rate
- Team satisfaction
- Retention at 3, 6, 12 months

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Python PEP 8 style guide for backend code
- Use TypeScript and ESLint rules for frontend code
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use**
```bash
lsof -ti:8000 | xargs kill -9
# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Database errors**
```bash
# Delete and recreate database
rm grok_recruiter.db
python migrate_adaptive_learning.py
```

**Missing dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Issues

**Port 5173 in use**
```bash
# Kill process
lsof -ti:5173 | xargs kill -9
# Or use different port in vite.config.ts
```

**Node modules issues**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API Issues

**X API 401 errors**
- Verify API keys in `.env` file
- Check app permissions in X Developer Portal
- Regenerate tokens if needed

**Pinecone connection errors**
- Verify API key is correct
- Check index name matches configuration
- Ensure index dimensions match embedding size (1536 for OpenAI)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Grok AI** by xAI for powerful LLM capabilities
- **shadcn/ui** for beautiful React components
- **FastAPI** for excellent Python web framework
- **Pinecone** for vector database infrastructure

---

## 📞 Support

For issues, questions, or feedback:

1. Check the [documentation](docs/)
2. Review [existing issues](../../issues)
3. Create a [new issue](../../issues/new)
4. Consult the API documentation at `/docs`

---

## 🚀 Roadmap

### Phase 1 (Current - MVP)
- [x] Job creation and management
- [x] X-first candidate sourcing
- [x] AI-powered screening
- [x] Interview dispatch and evaluation
- [x] Adaptive learning system
- [x] Team matching
- [x] Dashboard and controls

### Phase 2 (Near-term)
- [ ] LinkedIn integration (real)
- [ ] Email outreach automation
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] Role-based access control
- [ ] Webhook integrations

### Phase 3 (Future)
- [ ] Neural network policies for deep RL
- [ ] Multi-objective optimization
- [ ] Transfer learning across companies
- [ ] Predictive analytics
- [ ] Candidate experience automation
- [ ] Integration with ATS systems

---

## 🌟 Why Grok Recruiter?

Traditional recruiting is broken:
- ⏰ **Slow**: Recruiters spend 13+ hours per hire on manual tasks
- 💰 **Expensive**: Average cost per hire is $4,000+
- 📉 **Inconsistent**: Human bias and fatigue affect decision quality
- 🔄 **No learning**: Same mistakes repeated without improvement

**Grok Recruiter solves this with:**
- ⚡ **Speed**: Automate 90% of manual sourcing and screening
- 💵 **Cost**: Reduce cost per hire by 70%+
- 🎯 **Consistency**: AI-powered decisions with transparent reasoning
- 🧠 **Learning**: Continuous improvement from every hiring outcome

Built for the future of recruiting. 🚀

---

<div align="center">

**Made with ❤️ and 🤖 AI**

[Documentation](docs/) • [API Docs](http://localhost:8000/docs) • [Report Bug](../../issues)

</div>

