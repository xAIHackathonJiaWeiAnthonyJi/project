"""
Seed teams for team matching
"""
from sqlmodel import Session, select
from app.db.database import engine
from app.models.schemas import Team

TEAMS = [
    {
        "name": "Frontend Platform",
        "description": "Building the next-generation UI framework and design system. Focused on performance, accessibility, and developer experience.",
        "tech_stack": ["React", "TypeScript", "Next.js", "Tailwind", "Storybook", "Vite"],
        "team_size": 8,
        "manager_name": "Sarah Johnson",
        "current_needs": ["Senior Frontend Engineer", "Design Systems Engineer"],
        "team_culture": "We value clean code, thorough testing, and beautiful UIs. Weekly design reviews, monthly hackathons. Remote-friendly with twice-weekly in-office days.",
        "projects": ["Component Library v3", "Performance Dashboard", "Accessibility Toolkit"],
        "location": "San Francisco (Hybrid)"
    },
    {
        "name": "Backend Infrastructure",
        "description": "Building scalable APIs and microservices that power millions of requests. Focus on reliability, performance, and observability.",
        "tech_stack": ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Kubernetes", "AWS"],
        "team_size": 10,
        "manager_name": "Michael Chen",
        "current_needs": ["Backend Engineer", "DevOps Engineer"],
        "team_culture": "Data-driven decision making, blameless postmortems, strong code review culture. On-call rotation. Remote-first with optional office access.",
        "projects": ["Service Mesh Migration", "Real-time Analytics Pipeline", "Auto-scaling Optimization"],
        "location": "Remote"
    },
    {
        "name": "AI/ML Platform",
        "description": "Building ML infrastructure for recommendation, search, and personalization. Working with LLMs, embeddings, and real-time inference.",
        "tech_stack": ["Python", "PyTorch", "TensorFlow", "FastAPI", "Kubernetes", "Airflow"],
        "team_size": 6,
        "manager_name": "Dr. Priya Patel",
        "current_needs": ["ML Engineer", "MLOps Engineer"],
        "team_culture": "Research-oriented, paper reading groups, conference presentations encouraged. Flexible hours, focus on impact over activity. Mostly remote.",
        "projects": ["LLM Fine-tuning Platform", "Real-time Recommendation Engine", "Model Monitoring Dashboard"],
        "location": "New York (Hybrid)"
    },
    {
        "name": "Mobile Experience",
        "description": "Building native iOS and Android apps with focus on performance and offline-first architecture.",
        "tech_stack": ["React Native", "TypeScript", "Swift", "Kotlin", "GraphQL"],
        "team_size": 7,
        "manager_name": "Alex Rivera",
        "current_needs": ["Mobile Engineer", "React Native Engineer"],
        "team_culture": "Mobile-first mindset, emphasis on UX polish and performance. Weekly app reviews, cross-platform collaboration. Hybrid work model.",
        "projects": ["Offline Mode v2", "Push Notification System", "In-App Messaging"],
        "location": "Austin (Hybrid)"
    },
    {
        "name": "Data Platform",
        "description": "Building data warehouse, ETL pipelines, and analytics tools. Enabling data-driven decisions across the company.",
        "tech_stack": ["Python", "Spark", "Airflow", "Snowflake", "dbt", "Looker"],
        "team_size": 5,
        "manager_name": "Elena Rodriguez",
        "current_needs": ["Data Engineer", "Analytics Engineer"],
        "team_culture": "Collaborative, emphasis on data quality and documentation. Regular knowledge sharing sessions. Flexible remote work.",
        "projects": ["Data Lake Migration", "Real-time Streaming Pipeline", "Self-service Analytics Platform"],
        "location": "Seattle (Remote)"
    },
    {
        "name": "Security & Compliance",
        "description": "Ensuring application security, data privacy, and regulatory compliance. Building security tools and conducting audits.",
        "tech_stack": ["Python", "Go", "Kubernetes", "AWS", "Terraform", "Vault"],
        "team_size": 4,
        "manager_name": "James Kim",
        "current_needs": ["Security Engineer", "Compliance Engineer"],
        "team_culture": "Security-first mindset, proactive threat modeling, regular security reviews. On-call rotation for incidents. Hybrid work.",
        "projects": ["Zero Trust Architecture", "Automated Compliance Checks", "Threat Detection Platform"],
        "location": "Boston (Hybrid)"
    }
]


def seed_teams():
    """Seed teams into database"""
    
    with Session(engine) as session:
        # Check if teams already exist
        existing = session.exec(select(Team)).all()
        if existing:
            print(f"⚠️  {len(existing)} teams already exist. Skipping seed.")
            return
        
        print("🏢 Creating teams...")
        
        for team_data in TEAMS:
            team = Team(**team_data)
            session.add(team)
        
        session.commit()
        
        print(f"✅ Successfully created {len(TEAMS)} teams!\n")
        print("Teams:")
        for team_data in TEAMS:
            print(f"  • {team_data['name']} ({team_data['team_size']} people)")
            print(f"    Tech: {', '.join(team_data['tech_stack'][:3])}...")
            print(f"    Needs: {', '.join(team_data['current_needs'])}")
            print()


if __name__ == "__main__":
    seed_teams()

