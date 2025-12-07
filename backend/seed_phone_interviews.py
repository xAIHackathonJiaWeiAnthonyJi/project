"""
Seed database with mock phone screen interviews including transcripts
"""
from sqlmodel import Session, select
from app.db.database import engine
from app.models.schemas import (
    Job, Candidate, JobCandidate, InterviewTemplate, InterviewSubmission
)
from datetime import datetime, timedelta
import random

# Sample phone screen transcripts
TRANSCRIPTS = [
    {
        "candidate_name": "Sarah Chen",
        "duration": 32,
        "transcript": """Interviewer: Hi Sarah, thanks for joining today. Can you start by telling me about your experience with React?

Sarah: Hi! Yes, I'd love to. I've been working with React for about 4 years now, primarily building large-scale web applications. In my current role at TechCorp, I'm the lead frontend engineer and I've architected our entire component library using React with TypeScript. We use hooks extensively, and I'm really comfortable with the latest patterns like compound components and custom hooks for shared logic.

Interviewer: That's great. Can you walk me through how you handle state management in complex React applications?

Sarah: Sure! It really depends on the complexity. For smaller apps or features, I stick with React's built-in useState and useContext. But for larger applications with complex data flows, I prefer using Zustand or Redux Toolkit. I like Zustand because it's lightweight and the API is very intuitive. We recently migrated from Redux to Zustand and saw about 40% reduction in boilerplate code. I also use React Query for server state management - it handles caching, invalidation, and background updates really elegantly.

Interviewer: Interesting. How do you approach performance optimization in React?

Sarah: Performance is something I'm quite passionate about. I start with React DevTools Profiler to identify bottlenecks. Common optimizations I use include React.memo for preventing unnecessary re-renders, useMemo and useCallback for expensive computations and stable references. I'm also big on code splitting - using React.lazy and Suspense to load components on demand. For long lists, I implement virtualization with react-window. And of course, proper key usage in lists is crucial.

Interviewer: Have you worked with Next.js or server-side rendering?

Sarah: Yes, definitely. My last project was a Next.js application with both SSR and SSG. I really appreciate how Next.js handles routing and the App Router is fantastic. We used server components for data fetching which improved our initial load times significantly. The caching strategies and incremental static regeneration are game-changers for content-heavy sites. I'm also familiar with the new Server Actions feature in Next.js 14.

Interviewer: Great! Last question - how do you ensure code quality and maintainability in your projects?

Sarah: I'm a strong advocate for testing. We use Jest and React Testing Library for unit and integration tests - I aim for at least 80% coverage. For E2E testing, we use Playwright. I also enforce strict TypeScript - no 'any' types unless absolutely necessary. We have ESLint and Prettier configured, and I've contributed to our team's style guide. Code reviews are mandatory, and I make sure we're following SOLID principles and keeping components small and focused. Documentation is also key - we use Storybook for our component library.

Interviewer: Excellent answers, Sarah. Do you have any questions for us?

Sarah: Yes! I'd love to know more about the tech stack you're using and what the biggest technical challenges are that the team is facing right now?

Interviewer: [Discusses company stack and challenges]

Sarah: That sounds really exciting! I'm particularly interested in the performance optimization challenges you mentioned. Thanks for the great conversation!

Interviewer: Thank you, Sarah. We'll be in touch soon!""",
        "score": 92,
        "reasoning": "Sarah demonstrated exceptional technical depth and breadth across React ecosystem. Her responses were clear, structured, and showed practical experience with modern tools and best practices. She proactively mentioned specific metrics (40% code reduction) and showed strong understanding of performance optimization. Her question at the end showed genuine interest and technical curiosity.",
        "strengths": [
            "Deep React expertise including latest patterns and hooks",
            "Strong focus on performance optimization with concrete strategies",
            "Excellent communication - clear, structured, and articulate",
            "Practical experience with modern tools (Zustand, React Query, Next.js)",
            "Quality-focused approach with testing and code review practices"
        ],
        "weaknesses": [
            "Could have mentioned accessibility considerations",
            "Didn't discuss experience with CSS-in-JS solutions"
        ],
        "recommendation": "strong_yes"
    },
    {
        "candidate_name": "Alex Rivera",
        "duration": 28,
        "transcript": """Interviewer: Hi Alex, thanks for joining. Tell me about your backend development experience.

Alex: Hey! Thanks for having me. I've been doing backend development for about 6 years, mostly with Node.js and Python. My current role is senior backend engineer at DataFlow, where I design and build microservices. We use Node with Express and TypeScript, and Python with FastAPI for our data processing pipelines.

Interviewer: How do you handle scalability in your services?

Alex: That's a great question. Scalability is all about horizontal scaling, caching, and async processing. We use Kubernetes for container orchestration which makes it easy to scale services up and down based on load. For caching, Redis is our go-to - we cache frequently accessed data and use it for rate limiting too. For long-running tasks, we use message queues like RabbitMQ or AWS SQS. Database-wise, we use read replicas for heavy read operations and sharding for really large datasets.

Interviewer: Can you talk about your experience with databases?

Alex: Sure! I work primarily with PostgreSQL and MongoDB. For relational data with complex relationships, Postgres is my choice - I'm comfortable writing complex queries, using indexes effectively, and understanding query plans. For document-based or rapidly changing schemas, MongoDB works well. I've also worked with Elasticsearch for search functionality and Redis for caching. Understanding when to use SQL vs NoSQL is important - I always consider data structure, query patterns, and consistency requirements.

Interviewer: How do you ensure API security?

Alex: Security is critical. I always implement JWT-based authentication with refresh tokens. We use OAuth2 for third-party integrations. Rate limiting is essential to prevent abuse - I use Redis-backed rate limiters. Input validation is done at multiple layers using libraries like Joi or Zod. We sanitize all inputs to prevent SQL injection. CORS is properly configured. For sensitive data, we encrypt at rest and in transit using TLS. API keys are stored in environment variables, never in code. We also have automated security scanning in our CI/CD pipeline.

Interviewer: Tell me about a challenging bug you solved recently.

Alex: Oh, we had an interesting one last month. Our API was experiencing random 500 errors under load. Turned out to be a race condition in our connection pool management. Under high concurrency, multiple requests were trying to acquire connections simultaneously and some were timing out. I fixed it by implementing proper connection pooling with pg-pool for Postgres and adding retry logic with exponential backoff. I also added better monitoring with Datadog so we could catch these issues earlier.

Interviewer: Good problem solving. Any questions for us?

Alex: Yeah! What's your deployment process like? And how do you handle on-call rotations?

Interviewer: [Discusses deployment and on-call]

Alex: Sounds good, thanks for the info!""",
        "score": 85,
        "reasoning": "Alex showed solid backend engineering experience with good coverage of essential topics including scalability, databases, and security. Responses were competent and showed practical problem-solving ability. The example of debugging the race condition demonstrated good debugging skills. However, responses could have been more detailed in some areas, and communication was straightforward but not as polished as top candidates.",
        "strengths": [
            "Strong knowledge of scalability patterns (caching, message queues, k8s)",
            "Good security awareness with multiple layers of protection",
            "Practical problem-solving demonstrated with real debugging example",
            "Comfortable with both SQL and NoSQL databases",
            "Understanding of when to use different technologies"
        ],
        "weaknesses": [
            "Responses were somewhat brief and could use more detail",
            "Didn't mention testing strategies or CI/CD in depth",
            "Could have discussed monitoring and observability more",
            "Questions at end were functional but not deeply technical"
        ],
        "recommendation": "yes"
    },
    {
        "candidate_name": "Maria Garcia",
        "duration": 25,
        "transcript": """Interviewer: Hi Maria, thanks for joining us today. Can you tell me about your experience with Python and data engineering?

Maria: Hi! Sure, I've been working with Python for about 5 years, mainly in data engineering roles. I build ETL pipelines and work with big data processing.

Interviewer: What tools do you use for ETL?

Maria: Mostly Airflow for orchestration. I write DAGs to schedule jobs. We also use Spark for big data processing.

Interviewer: How do you handle data quality?

Maria: Um, we have some data validation checks in our pipelines. We check for null values and duplicates. If there's an issue, we log it and send an alert.

Interviewer: Can you be more specific about your validation approaches?

Maria: Well, we write Python scripts that check the data before it goes into the warehouse. Like checking if the columns are correct and if the data types match what we expect.

Interviewer: Tell me about a complex data pipeline you've built.

Maria: In my last job, I built a pipeline that pulled data from multiple APIs, transformed it, and loaded it into our data warehouse. It ran every day and processed customer data. We used Pandas for the transformations.

Interviewer: What challenges did you face?

Maria: The main challenge was handling API rate limits. Sometimes the APIs would fail and we'd have to retry. Also, the data wasn't always in the format we expected, so we had to handle those edge cases.

Interviewer: How did you solve the rate limit issue?

Maria: We added some delays between API calls and implemented retry logic. If an API call failed, it would wait and try again a few times before giving up.

Interviewer: Do you have experience with cloud platforms?

Maria: Yes, we use AWS. I've worked with S3 for storage and EC2 for running our jobs. I'm familiar with some of the AWS services.

Interviewer: Which ones specifically?

Maria: S3, EC2, and I think we used Lambda functions for some things too. I'm still learning about the different AWS services though.

Interviewer: Any questions for me?

Maria: How big is the data team? And what tools do you use?

Interviewer: [Answers questions]

Maria: Thanks!""",
        "score": 58,
        "reasoning": "Maria has foundational data engineering experience but lacks the depth expected for a senior role. Her responses were vague and lacked technical specificity. While she mentioned the right tools (Airflow, Spark, AWS), she couldn't articulate deep understanding or best practices. The pipeline example was basic and didn't demonstrate handling complex scenarios. Communication was adequate but answers needed prompting for details.",
        "strengths": [
            "Familiar with core data engineering tools (Airflow, Spark, Pandas)",
            "Has experience building end-to-end ETL pipelines",
            "Understands basic concepts like data quality and error handling",
            "Experience with cloud platforms (AWS)"
        ],
        "weaknesses": [
            "Responses lacked technical depth and specificity",
            "Limited understanding of advanced data quality strategies",
            "Couldn't articulate complex problem-solving beyond basic approaches",
            "Uncertain about AWS services ('I think we used Lambda')",
            "Questions at end were basic and didn't show deep curiosity"
        ],
        "recommendation": "maybe"
    }
]


def seed_phone_interviews():
    """Seed phone screen interviews with transcripts"""
    
    with Session(engine) as session:
        # Get first job
        job = session.exec(select(Job)).first()
        if not job:
            print("❌ No jobs found. Run seed_database.py first.")
            return
        
        # Create phone screen template if not exists
        template_query = select(InterviewTemplate).where(
            InterviewTemplate.job_id == job.id,
            InterviewTemplate.interview_type == "phone_screen"
        )
        template = session.exec(template_query).first()
        
        if not template:
            template = InterviewTemplate(
                job_id=job.id,
                interview_type="phone_screen",
                title="Technical Phone Screen",
                description="30-minute phone interview covering technical experience, problem-solving, and cultural fit.",
                questions={
                    "questions": [
                        {"question": "Tell me about your experience with [relevant technology]"},
                        {"question": "How do you handle [technical challenge]?"},
                        {"question": "Walk me through a challenging problem you solved"},
                        {"question": "How do you ensure code quality/data quality?"},
                        {"question": "Do you have any questions for us?"}
                    ]
                },
                evaluation_criteria={
                    "technical_knowledge": 30,
                    "communication": 25,
                    "problem_solving": 25,
                    "experience_depth": 20
                },
                time_limit_hours=None  # Phone screens are scheduled
            )
            session.add(template)
            session.commit()
            session.refresh(template)
            print(f"✅ Created phone screen template: {template.title}")
        
        # Process each transcript
        for transcript_data in TRANSCRIPTS:
            # Find candidate by name
            candidate_query = select(Candidate).where(
                Candidate.name == transcript_data["candidate_name"]
            )
            candidate = session.exec(candidate_query).first()
            
            if not candidate:
                print(f"⚠️  Candidate {transcript_data['candidate_name']} not found, skipping...")
                continue
            
            # Check if submission already exists
            existing = session.exec(
                select(InterviewSubmission).where(
                    InterviewSubmission.candidate_id == candidate.id,
                    InterviewSubmission.job_id == job.id,
                    InterviewSubmission.template_id == template.id
                )
            ).first()
            
            if existing:
                print(f"⚠️  Interview already exists for {candidate.name}, skipping...")
                continue
            
            # Create interview submission with transcript
            submission = InterviewSubmission(
                candidate_id=candidate.id,
                job_id=job.id,
                template_id=template.id,
                status="reviewed",  # Already evaluated
                submitted_at=datetime.utcnow() - timedelta(days=random.randint(1, 7)),
                call_transcript=transcript_data["transcript"],
                call_duration_minutes=transcript_data["duration"],
                call_recording_url=f"https://recordings.example.com/{candidate.id}-call.mp3",
                submission_data={
                    "completed": True,
                    "call_completed_at": (datetime.utcnow() - timedelta(days=random.randint(1, 7))).isoformat()
                },
                ai_score=transcript_data["score"],
                ai_reasoning=transcript_data["reasoning"],
                ai_strengths=transcript_data["strengths"],
                ai_weaknesses=transcript_data["weaknesses"],
                ai_recommendation=transcript_data["recommendation"]
            )
            
            session.add(submission)
            session.commit()
            session.refresh(submission)
            
            print(f"✅ Created phone interview for {candidate.name} (Score: {submission.ai_score}/100)")
        
        print(f"\n🎉 Successfully seeded {len(TRANSCRIPTS)} phone screen interviews with transcripts!")


if __name__ == "__main__":
    seed_phone_interviews()

