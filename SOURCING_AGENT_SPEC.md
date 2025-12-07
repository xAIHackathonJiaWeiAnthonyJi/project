# 🧠 Cursor Context Prompt — X-First Candidate Outreach & Sourcing Agent (A1)

This document defines the **official sourcing and outreach logic** for the Grok Recruiter MVP.

All code that performs candidate discovery must strictly follow this pipeline.

This sourcing flow is **X-first**, embedding-driven, and role-aware.

---

## 🎯 OBJECTIVE

Automatically discover, evaluate, and rank **high-intent technical candidates** using:

- Job description embeddings
- Topic discovery on X
- Behavioral signals from X users
- Role-matching via profile retrieval
- Experience validation via LinkedIn (mocked)
- AI-powered compatibility scoring

This replaces **manual recruiter sourcing** with an **AI-driven discovery engine**.

---

## 🧩 HIGH-LEVEL OUTREACH STRATEGY

We source candidates using a **semantic + behavioral funnel**:

1. **Job → Embedding**
2. **Embedding → Topic Discovery on X**
3. **Topic → Active X Users**
4. **X Users → Role Verification**
5. **Role Match → Experience Validation (LinkedIn, mocked)**
6. **Experience → AI Compatibility Scoring**
7. **Score → Ranked Candidate List**

Only candidates that pass **all filters** enter the recruiting pipeline.

---

## ✅ CANONICAL SOURCING FLOW (STEP-BY-STEP)

This is the **exact execution order** that the Sourcing Agent (A1) must follow.

---

### ✅ STEP 1 — JOB DESCRIPTION → EMBEDDING

**Input:**
- Job Title
- Job Description

**Process:**
- Generate a **vector embedding** from the job description.
- This embedding represents the **semantic intent of the role**.

**Purpose:**
- This is the **root signal** for all downstream discovery.

---

### ✅ STEP 2 — EMBEDDING → TOPIC DISCOVERY ON X

**Process:**
- Use the job embedding to generate:
  - A list of **relevant technical topics**
  - A list of **search queries**
- Example (for ML Engineer):
  - "LLM inference"
  - "PyTorch performance"
  - "CUDA kernels"
  - "transformer optimization"

This step converts:
> "What are we hiring for?"

into:
> "What should we search on X?"

---

### ✅ STEP 3 — TOPIC → ACTIVE X USERS

For each topic:

**We search for:**
- Users who **post about** the topic
- Users who **interact with** (like/reply to) topic posts
- Users who **follow topic-adjacent accounts**

**Signal Types Collected:**
- Post text
- Bio
- Replies
- Engagement frequency
- Topic consistency

This yields a pool of:
> "People who actively talk about this domain."

---

### ✅ STEP 4 — X USERS → DEVELOPER ROLE VERIFICATION

For each discovered X user:

**We retrieve their profile and ask:**
- Are they a **developer**?
- Are they aligned with:
  - Backend
  - ML
  - Infra
  - Frontend
  - Systems

**This is an AI classification step.**

Only users classified as:
> "Likely developer matching this job role"

are allowed to pass.

Others are discarded.

---

### ✅ STEP 5 — EXPERIENCE VALIDATION (LINKEDIN — MOCKED)

For each verified developer:

**We attempt to retrieve:**
- Company history
- Titles
- Stack exposure
- Years of experience
- Domains

⚠️ For the hackathon:
- This step is **mocked using synthetic LinkedIn data**
- Hardcoded profiles are allowed
- The interface must act as if real retrieval occurred

This gives us:
> A structured professional experience profile.

---

### ✅ STEP 6 — AI COMPATIBILITY SCORING

Now we compute **true candidate–job fit**.

**Input to AI:**
- Job description (structured)
- X behavioral signals
- Mocked LinkedIn experience

**AI Outputs:**
- `compatibility_score` (0–100)
- Strengths
- Weaknesses
- Skill match explanation
- Domain alignment

This score represents:
> "How well does this person match THIS specific job?"

---

### ✅ STEP 7 — RANKING & PIPELINE INSERTION

All passing candidates are:
- Sorted by `compatibility_score`
- Top K candidates are:
  - Inserted into `job_candidates`
  - `stage = sourced`
- Lower-ranked candidates are saved for later but not surfaced

This produces a **clean, ranked shortlist** for screening.

---

## ✅ WHAT THIS PIPELINE PROVES TO JUDGES

This system shows:

- ✅ Semantic job understanding
- ✅ Real-world behavioral sourcing
- ✅ Signal fusion (X + LinkedIn)
- ✅ AI-based role verification
- ✅ AI-driven compatibility scoring
- ✅ Automatic ranking
- ✅ End-to-end automation of recruiter sourcing

This is **not keyword scraping**.
This is **intent-based talent discovery**.

---

## ⚠️ HARD CONSTRAINTS

- No keyword-only search allowed
- Topics must come from job embeddings
- All developer classification must be AI-based
- LinkedIn retrieval must be mocked but structured
- All compatibility scores must be AI-generated (not hardcoded)

---

## 🔗 OUTPUT OF THIS AGENT (A1)

The sourcing agent must output:

- A ranked list of candidate objects:
  - X profile
  - Behavioral signals
  - Mocked LinkedIn experience
  - Compatibility score
  - AI reasoning

These outputs are passed to:

→ **A2: Profile Builder Agent**
→ Then into **A3: Screening Agent**

---

This document defines the **only acceptable outreach and sourcing logic** for the Grok Recruiter MVP.

All sourcing code generated in Cursor must strictly follow this flow.

