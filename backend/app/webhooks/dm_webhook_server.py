"""
X API Webhook Server for DM Events

Listens for incoming DM responses from candidates
"""
from flask import Flask, request, jsonify
import os
import hmac
import hashlib
import base64
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

HOST = "0.0.0.0"
PORT = 8081  # Changed from 8080 (in use by frontend)

app = Flask(__name__)

CONSUMER_SECRET = os.getenv("X_CONSUMER_SECRET")

# In-memory storage for demo (use database in production)
received_dms = []

@app.route('/webhooks', methods=['GET', 'POST'])
def webhook_request():
    """
    Main webhook endpoint
    
    GET: Handles CRC challenge for webhook validation
    POST: Receives real-time DM events
    """
    
    if request.method == 'GET':
        # CRC Challenge Response
        crc_token = request.args.get("crc_token")
        if crc_token:
            sha256_hash_digest = hmac.new(
                CONSUMER_SECRET.encode(),
                msg=crc_token.encode(),
                digestmod=hashlib.sha256
            ).digest()
            response_token = "sha256=" + base64.b64encode(sha256_hash_digest).decode()
            
            print(f"✅ CRC Challenge validated at {datetime.now()}")
            return jsonify({"response_token": response_token}), 200
        
        return "", 200
    
    elif request.method == 'POST':
        # Receive webhook event
        data = request.get_json(silent=True)
        
        if data:
            print(f"\n📨 Received webhook event at {datetime.now()}")
            print(f"Event type: {list(data.keys())}")
            
            # Check for DM events
            if 'direct_message_events' in data:
                for dm_event in data['direct_message_events']:
                    process_dm_event(dm_event, data.get('users', {}))
            
            # Check for replay job status
            if 'replay_job_status' in data:
                print(f"   Replay job: {data['replay_job_status']['job_state']}")
            
        else:
            print(f"⚠️ Received non-JSON data: {request.data}")
        
        return "", 200
    
    return "Method Not Allowed", 405

def process_dm_event(dm_event: dict, users: dict):
    """
    Process incoming DM event
    
    Args:
        dm_event: DM event data
        users: User lookup dict
    """
    sender_id = dm_event.get('message_create', {}).get('sender_id')
    message_text = dm_event.get('message_create', {}).get('message_data', {}).get('text')
    
    if not sender_id or not message_text:
        return
    
    # Get user info
    user_info = users.get(sender_id, {})
    username = user_info.get('screen_name', 'unknown')
    name = user_info.get('name', 'unknown')
    
    # Store DM
    dm_record = {
        "timestamp": datetime.now().isoformat(),
        "sender_id": sender_id,
        "username": username,
        "name": name,
        "message": message_text,
        "is_replay": dm_event.get('replay', False)
    }
    
    received_dms.append(dm_record)
    
    print(f"\n💬 New DM from @{username} ({name}):")
    print(f"   Message: {message_text[:100]}...")
    print(f"   Total DMs received: {len(received_dms)}")
    
    # TODO: Check if this is a candidate responding to outreach
    # TODO: Store in database and trigger follow-up workflow

@app.route('/dms', methods=['GET'])
def get_dms():
    """API endpoint to view received DMs"""
    return jsonify({
        "total_dms": len(received_dms),
        "dms": received_dms
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "webhook_active": True,
        "dms_received": len(received_dms)
    })

def main():
    """Start the webhook server"""
    from waitress import serve
    print(f"🚀 Starting X Webhook Server on {HOST}:{PORT}")
    print(f"📡 Webhook endpoint: http://{HOST}:{PORT}/webhooks")
    print(f"🏥 Health check: http://{HOST}:{PORT}/health")
    print(f"💬 View DMs: http://{HOST}:{PORT}/dms")
    print("\n⚠️  Remember to expose this via HTTPS (ngrok) before registering!")
    serve(app, host=HOST, port=PORT)

if __name__ == "__main__":
    main()

