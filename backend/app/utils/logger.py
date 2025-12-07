from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import Session
from app.models.schemas import AgentLog
from app.db.database import engine

class AgentLogger:
    """Utility class for logging agent actions to the database"""
    
    @staticmethod
    def log(
        logtype: str,
        message: str,
        job_id: Optional[int] = None,
        candidate_id: Optional[int] = None,
        **kwargs
    ):
        """
        Log an agent action to the database
        
        Args:
            logtype: Type of action (e.g., "sourcing", "scoring", "outreach", "search")
            message: Detailed description of the action
            job_id: Optional job ID for context
            candidate_id: Optional candidate ID for context
            **kwargs: Additional context data
        """
        try:
            with Session(engine) as session:
                log_entry = AgentLog(
                    logtype=logtype,
                    log=message,
                    job_id=job_id,
                    candidate_id=candidate_id,
                    context=kwargs if kwargs else None,
                    timestamp=datetime.utcnow()
                )
                session.add(log_entry)
                session.commit()
        except Exception as e:
            # Don't let logging failures break the main application
            print(f"Failed to log agent action: {e}")
    
    @staticmethod
    def log_sourcing(message: str, job_id: Optional[int] = None, candidate_id: Optional[int] = None, **kwargs):
        """Log sourcing-related actions"""
        AgentLogger.log("sourcing", message, job_id, candidate_id, **kwargs)
    
    @staticmethod
    def log_scoring(message: str, job_id: Optional[int] = None, candidate_id: Optional[int] = None, **kwargs):
        """Log scoring-related actions"""
        AgentLogger.log("scoring", message, job_id, candidate_id, **kwargs)
    
    @staticmethod
    def log_outreach(message: str, job_id: Optional[int] = None, candidate_id: Optional[int] = None, **kwargs):
        """Log outreach-related actions"""
        AgentLogger.log("outreach", message, job_id, candidate_id, **kwargs)
    
    @staticmethod
    def log_search(message: str, job_id: Optional[int] = None, **kwargs):
        """Log search-related actions"""
        AgentLogger.log("search", message, job_id, None, **kwargs)
    
    @staticmethod
    def log_embedding(message: str, job_id: Optional[int] = None, **kwargs):
        """Log embedding-related actions"""
        AgentLogger.log("embedding", message, job_id, None, **kwargs)
    
    @staticmethod
    def log_error(message: str, error: Exception, **kwargs):
        """Log error events"""
        context_data = {"error": str(error), "error_type": type(error).__name__, **kwargs}
        AgentLogger.log("error", message, **context_data)

    @staticmethod
    def log_interview(message: str, job_id: Optional[int] = None, candidate_id: Optional[int] = None, **kwargs):
        """Log interview-related actions"""
        AgentLogger.log("interview", message, job_id, candidate_id, **kwargs)

# Convenience function for quick logging
def log_agent_action(logtype: str, message: str, **kwargs):
    """Quick logging function"""
    AgentLogger.log(logtype, message, **kwargs)