from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
from app.api.routes import jobs, logs, candidates, activity, sourcing, interviews, teams, learning, learning

app = FastAPI(title="Grok Recruiter API")

# Configure CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Health check
@app.get("/")
async def root():
    return {"status": "online", "service": "Grok Recruiter API", "db": "SQLite"}

# Include routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(candidates.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(sourcing.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(learning.router, prefix="/api")
app.include_router(learning.router, prefix="/api")

