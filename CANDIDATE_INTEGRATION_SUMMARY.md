# Candidate Scraping Integration Summary

## ✅ What's Stored

When the sourcing agent runs, it scrapes and stores the following candidate information:

### From X/Twitter:
- **X Handle** (`x_handle`) - Twitter username (e.g., @DevC33jay)
- **X Bio** (`x_bio`) - Their Twitter profile bio/description
- **Name** - Extracted from their Twitter profile

### Synthetic LinkedIn Data (Generated from X Profile):
- **Headline** - Job title inferred from X activity
- **Location** - (defaults to "Unknown" if not found)
- **Experience** - Mock work experience inferred from their posts
- **Skills** - Technical skills extracted from bio and tweets
- **Years of Experience** - Estimated based on activity
- **GitHub Stats** (if available):
  - Repository count
  - Star count
  - Contributions
  - Programming languages

### AI Scoring Data (Per Job):
- **Compatibility Score** (`aiScore`) - 0-100 score for job fit
- **AI Reasoning** (`aiReasoning`) - Explanation of why they're a good/bad fit
- **Strengths** - Array of positive attributes
- **Weaknesses** - Array of areas for improvement
- **Stage** - Current pipeline stage (sourced, screened, interview, etc.)

---

## 🎯 How to Access This Data

### 1. **View All Scraped Candidates**

**API Endpoint:**
```bash
GET http://localhost:8000/api/candidates/
```

**Example Response:**
```json
[
  {
    "id": 6,
    "name": "Maghori Michael",
    "x_handle": "@DevC33jay",
    "x_bio": "Front-End Dev who ships AI tools for Founders...",
    "linkedin_data": {
      "headline": "Frontend Engineer (X Profile)",
      "skills": ["React", "TypeScript", "FullStack Developer"],
      "github_stats": { ... }
    },
    "created_at": "2025-12-07T16:45:17.441201"
  }
]
```

### 2. **View Candidates for a Specific Job (with AI Scoring)**

**API Endpoint:**
```bash
GET http://localhost:8000/api/candidates/?job_id=1
```

**Example Response:**
```json
[
  {
    "id": 6,
    "name": "Maghori Michael",
    "x_handle": "@DevC33jay",
    "status": "takehome_assigned",
    "aiScore": 72.0,
    "aiReasoning": "Strong frontend skills with React expertise...",
    "strengths": ["React expertise", "Active builder", "AI tools focus"],
    "weaknesses": ["Limited backend experience"],
    "jobId": 1
  }
]
```

### 3. **Frontend Pages**

#### **Candidates List Page**
- **URL:** `http://localhost:5173/candidates`
- **Shows:** All candidates with filtering by status
- **Displays:**
  - Candidate name and avatar
  - AI compatibility score (color-coded)
  - Status badge (sourced, screened, interview, etc.)
  - Skills from their profile
  - Location
  - GitHub stars (if available)
  - Twitter link

#### **Candidate Detail Page**
- **URL:** `http://localhost:5173/candidates/{id}`
- **Shows:** Complete candidate profile
- **Displays:**
  - Full AI reasoning and assessment
  - **Strengths** (green checkmarks)
  - **Weaknesses** (orange arrows)
  - X/Twitter bio (scraped data)
  - Experience timeline
  - All skills
  - GitHub statistics
  - Links to Twitter, GitHub, LinkedIn

---

## 📊 Current Database State

After seeding and running the sourcing agent, you now have:

| ID Range | Source | Count | Description |
|----------|--------|-------|-------------|
| 1-5 | Seed Data | 5 | Mock candidates with complete profiles |
| 6-15 | **Real Scraping** | 10 | **Live candidates sourced from X/Twitter** |

### Real Scraped Examples:
- **@DevC33jay** - Front-End Dev (AI tools for Founders)
- **@ashanmhmd** - Running ads by day, building apps by night
- **@devDissentNT** - Teaching for life, coding for passion (TS/React)
- **@wizardmrl** - Angular developer
- **@bhavishya_one** - Full-Stack Developer (React, Node.js, TypeScript)

---

## 🔧 API Integration Details

### Backend Changes Made:
1. ✅ Fixed `/api/candidates/` endpoint to return job-specific scoring data
2. ✅ Removed `response_model` constraint to allow enriched data
3. ✅ Added proper field mapping (aiScore, aiReasoning, strengths, weaknesses)

### Frontend Changes Made:
1. ✅ Updated `api.ts` to map all backend fields to frontend
2. ✅ Enhanced `CandidateDetail.tsx` to show:
   - Strengths/Weaknesses section
   - X/Twitter bio section
   - AI reasoning
3. ✅ Updated TypeScript types to include all scraped fields
4. ✅ `CandidateCard` already displays AI scores and status badges

---

## 🚀 How to Test

### 1. **Start the Backend:**
```bash
cd backend
python3 -m uvicorn app.main:app --reload
```

### 2. **Start the Frontend:**
```bash
cd frontend
npm run dev
```

### 3. **View Candidates:**
- Navigate to: `http://localhost:5173/candidates`
- You'll see all 15 candidates (5 mock + 10 real scraped)
- Click any candidate to see full details

### 4. **Filter by Job:**
- The candidates page will show job-specific data when viewing from a job detail page
- Or use the API directly: `curl http://localhost:8000/api/candidates/?job_id=1`

---

## 📝 Data Flow Summary

```
┌─────────────────────┐
│  Sourcing Agent     │
│  Scrapes X/Twitter  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Candidate Table   │
│  - name             │
│  - x_handle         │
│  - x_bio            │
│  - linkedin_data    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ JobCandidate Table  │
│  - compatibility    │
│  - ai_reasoning     │
│  - strengths        │
│  - weaknesses       │
│  - stage            │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  API /candidates/   │
│  Merges both tables │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Frontend UI       │
│  - Candidate List   │
│  - Detail Pages     │
└─────────────────────┘
```

---

## 🎨 UI Components That Display Scraped Data

### `CandidateCard.tsx`
- ✅ Shows AI score badge
- ✅ Shows status (sourced, screened, etc.)
- ✅ Shows skills from LinkedIn data
- ✅ Shows GitHub stars
- ✅ Links to Twitter profile

### `CandidateDetail.tsx`
- ✅ AI Summary section
- ✅ AI Reasoning section
- ✅ **NEW:** Strengths & Weaknesses section
- ✅ **NEW:** X/Twitter Bio section
- ✅ Experience from LinkedIn data
- ✅ Skills section
- ✅ GitHub statistics panel

---

## 🔍 Example Queries

### Get all candidates:
```bash
curl http://localhost:8000/api/candidates/
```

### Get candidates for a job with scores:
```bash
curl http://localhost:8000/api/candidates/?job_id=1
```

### Filter by status:
```bash
curl "http://localhost:8000/api/candidates/?job_id=1&status=interview"
```

### Get single candidate details:
```bash
curl http://localhost:8000/api/candidates/6
```

---

## ✨ What's Working

- ✅ X/Twitter scraping via sourcing agent
- ✅ Candidate data stored in database
- ✅ LinkedIn data synthesized from X profiles
- ✅ AI scoring and reasoning
- ✅ Strengths/weaknesses analysis
- ✅ Backend API returns enriched data
- ✅ Frontend displays all scraped information
- ✅ Candidate list with filtering
- ✅ Detailed candidate profiles
- ✅ Links to social profiles (X, GitHub, LinkedIn)

---

## 📚 Next Steps (Optional Enhancements)

1. **Add candidate search** - Search by name, skills, or X handle
2. **Add XSignals display** - Show their recent tweets/posts
3. **Add filtering by score range** - e.g., "Show candidates with score > 70"
4. **Add bulk actions** - Advance multiple candidates at once
5. **Add candidate notes** - Allow recruiters to add manual notes
6. **Real-time updates** - WebSocket integration for live sourcing status

---

**All candidate scraping is now fully integrated end-to-end! 🎉**

