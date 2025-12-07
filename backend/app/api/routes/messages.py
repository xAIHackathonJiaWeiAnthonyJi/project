import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from xdk import Client
from xdk.users import UsersClient
from dotenv import load_dotenv
from app.utils.oauth import create_oauth_request

load_dotenv()

X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")
X_CONSUMER_KEY = os.getenv("X_CONSUMER_KEY")
X_CONSUMER_SECRET = os.getenv("X_CONSUMER_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")

router = APIRouter()

class MessageRequest(BaseModel):
    username: str
    message: str

@router.post("/send")
async def send_message(request: MessageRequest):
    """Send a message to a user on X using OAuth 1.0a"""
    if not X_BEARER_TOKEN:
        raise HTTPException(status_code=503, detail="X_BEARER_TOKEN not configured")
    
    if not all([X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
        raise HTTPException(status_code=503, detail="OAuth 1.0a credentials not configured")
    
    # Get user ID using bearer token (read operation)
    client = Client(bearer_token=X_BEARER_TOKEN)
    users_client = UsersClient(client=client)
    
    username = request.username.replace("@", "")
    
    try:
        # Get user by username to get their ID
        user_response = users_client.get_by_username(username)
        if not user_response.data:
            raise HTTPException(status_code=404, detail=f"User @{username} not found")
        
        recipient_id = user_response.data["id"]
        
        # Send DM using OAuth 1.0a
        url = f"https://api.x.com/2/dm_conversations/with/{recipient_id}/messages"
        
        # Create OAuth authorization header
        auth_header = create_oauth_request(
            "POST", url, X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
        )
        
        # Send the request
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                url,
                headers={
                    "Authorization": auth_header,
                    "Content-Type": "application/json"
                },
                json={"text": request.message}
            )
        
        if response.status_code == 201:
            return {"success": True, "response": response.json()}
        else:
            return {"success": False, "error": response.status_code, "details": response.text}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))