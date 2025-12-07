from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = "grok_recruiter.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def init_db():
    # Import models to ensure they are registered with SQLModel metadata
    from app.models.schemas import Job, Candidate, JobCandidate, XSignal, AgentLog
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

