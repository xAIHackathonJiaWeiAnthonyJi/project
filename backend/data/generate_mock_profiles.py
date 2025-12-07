"""
Generate additional mock LinkedIn profiles
"""
import json

# Generate 20 more diverse profiles
additional_profiles = [
    {
        "x_handle": "@ml_researcher",
        "name": "Dr. Aisha Patel",
        "headline": "ML Research Scientist @ Google DeepMind",
        "location": "London, UK",
        "experience": [
            {"company": "Google DeepMind", "title": "Research Scientist", "duration": "2021-Present", "description": "Research on large language models and reinforcement learning"},
            {"company": "OpenAI", "title": "Research Engineer", "duration": "2018-2021", "description": "Worked on GPT-2 and GPT-3 training"}
        ],
        "education": [{"school": "MIT", "degree": "PhD Computer Science", "field": "Machine Learning", "year": "2018"}],
        "skills": ["Research", "PyTorch", "TensorFlow", "NLP", "LLMs", "Python"],
        "years_of_experience": 7
    },
    {
        "x_handle": "@devops_master",
        "name": "Carlos Rodriguez",
        "headline": "Senior DevOps Engineer @ Netflix",
        "location": "Los Gatos, CA",
        "experience": [
            {"company": "Netflix", "title": "Senior DevOps Engineer", "duration": "2020-Present", "description": "Managing kubernetes clusters, CI/CD pipelines"},
            {"company": "Amazon", "title": "DevOps Engineer", "duration": "2017-2020", "description": "AWS infrastructure, terraform, docker"}
        ],
        "education": [{"school": "University of Texas", "degree": "BS Computer Science", "field": "Systems", "year": "2017"}],
        "skills": ["Kubernetes", "AWS", "Docker", "Terraform", "Python", "Go"],
        "years_of_experience": 8
    },
    {
        "x_handle": "@ai_engineer",
        "name": "Maya Chen",
        "headline": "AI Engineer @ Anthropic",
        "location": "San Francisco, CA",
        "experience": [
            {"company": "Anthropic", "title": "AI Engineer", "duration": "2022-Present", "description": "Building Claude, working on AI safety"},
            {"company": "Meta", "title": "ML Engineer", "duration": "2019-2022", "description": "Recommendation systems, PyTorch"}
        ],
        "education": [{"school": "Carnegie Mellon", "degree": "MS Computer Science", "field": "AI", "year": "2019"}],
        "skills": ["PyTorch", "LLMs", "Python", "AI Safety", "Transformers"],
        "years_of_experience": 6
    },
    {
        "x_handle": "@data_scientist",
        "name": "Raj Sharma",
        "headline": "Senior Data Scientist @ Spotify",
        "location": "Stockholm, Sweden",
        "experience": [
            {"company": "Spotify", "title": "Senior Data Scientist", "duration": "2020-Present", "description": "Music recommendations, ML modeling"},
            {"company": "Uber", "title": "Data Scientist", "duration": "2017-2020", "description": "Demand forecasting, pricing algorithms"}
        ],
        "education": [{"school": "Stanford", "degree": "MS Statistics", "field": "Data Science", "year": "2017"}],
        "skills": ["Python", "scikit-learn", "SQL", "A/B Testing", "Statistics"],
        "years_of_experience": 8
    },
    {
        "x_handle": "@security_engineer",
        "name": "Emily Wilson",
        "headline": "Security Engineer @ Apple",
        "location": "Cupertino, CA",
        "experience": [
            {"company": "Apple", "title": "Security Engineer", "duration": "2021-Present", "description": "iOS security, cryptography"},
            {"company": "Google", "title": "Security Analyst", "duration": "2018-2021", "description": "Vulnerability research, penetration testing"}
        ],
        "education": [{"school": "UC Berkeley", "degree": "BS Computer Science", "field": "Security", "year": "2018"}],
        "skills": ["Security", "Cryptography", "C++", "Python", "iOS"],
        "years_of_experience": 7
    }
]

# Load existing profiles
with open('mock_linkedin_profiles.json', 'r') as f:
    existing = json.load(f)

# Combine
all_profiles = existing + additional_profiles

# Save
with open('mock_linkedin_profiles.json', 'w') as f:
    json.dump(all_profiles, f, indent=2)

print(f"✅ Generated {len(all_profiles)} total profiles ({len(additional_profiles)} new)")

