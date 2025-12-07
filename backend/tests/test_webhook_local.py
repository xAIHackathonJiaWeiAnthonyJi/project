"""
Test Webhook Server Locally (without ngrok)

This simulates what X API would send to your webhook
"""
import requests
import json
import hmac
import hashlib
import base64
import os
from dotenv import load_dotenv

load_dotenv()

WEBHOOK_URL = "http://localhost:8081/webhooks"
CONSUMER_SECRET = os.getenv("X_CONSUMER_SECRET")

def test_crc_challenge():
    """Test CRC challenge (what X sends during registration)"""
    print("=" * 60)
    print("TEST 1: CRC Challenge")
    print("=" * 60)
    
    crc_token = "test_challenge_token_12345"
    
    response = requests.get(
        WEBHOOK_URL,
        params={"crc_token": crc_token}
    )
    
    print(f"\nStatus: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ CRC Response: {data}")
        
        # Verify the response
        expected = hmac.new(
            CONSUMER_SECRET.encode(),
            msg=crc_token.encode(),
            digestmod=hashlib.sha256
        ).digest()
        expected_token = "sha256=" + base64.b64encode(expected).decode()
        
        if data.get('response_token') == expected_token:
            print("✅ CRC validation correct!")
        else:
            print("❌ CRC validation mismatch")
    else:
        print(f"❌ Failed with status {response.status_code}")

def test_dm_webhook():
    """Test incoming DM event (simulates what X would send)"""
    print("\n" + "=" * 60)
    print("TEST 2: Simulated DM Event")
    print("=" * 60)
    
    # Simulate a DM event payload (X API format)
    dm_event = {
        "direct_message_events": [
            {
                "id": "1234567890",
                "created_timestamp": "1638316800000",
                "message_create": {
                    "sender_id": "987654321",
                    "target": {
                        "recipient_id": "123456789"
                    },
                    "message_data": {
                        "text": "Yes, I'm interested in the ML Engineer role! Would love to learn more.",
                        "entities": {}
                    }
                }
            }
        ],
        "users": {
            "987654321": {
                "id": "987654321",
                "screen_name": "amitcoder1",
                "name": "Amit Hasan",
                "description": "ML Engineer building AI systems"
            }
        }
    }
    
    print(f"\n📨 Sending simulated DM from @amitcoder1:")
    print(f'   Message: "{dm_event["direct_message_events"][0]["message_create"]["message_data"]["text"]}"')
    
    response = requests.post(
        WEBHOOK_URL,
        json=dm_event,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\n✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ DM webhook received successfully!")
    else:
        print(f"❌ Failed with status {response.status_code}")

def test_view_dms():
    """View all received DMs"""
    print("\n" + "=" * 60)
    print("TEST 3: View Received DMs")
    print("=" * 60)
    
    response = requests.get("http://localhost:8081/dms")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Total DMs received: {data['total_dms']}")
        
        for i, dm in enumerate(data['dms'], 1):
            print(f"\n   {i}. From @{dm['username']} ({dm['name']})")
            print(f"      Time: {dm['timestamp']}")
            print(f"      Message: {dm['message'][:80]}...")
    else:
        print(f"❌ Failed to retrieve DMs")

def test_health():
    """Test health endpoint"""
    print("\n" + "=" * 60)
    print("TEST 0: Health Check")
    print("=" * 60)
    
    try:
        response = requests.get("http://localhost:8081/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Server is online!")
            print(f"   Status: {data['status']}")
            print(f"   Webhook active: {data['webhook_active']}")
            print(f"   DMs received: {data['dms_received']}")
            return True
        else:
            print(f"❌ Server returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return False

if __name__ == "__main__":
    print("\n🧪 TESTING X WEBHOOK SERVER")
    print("=" * 60)
    
    # Test if server is running
    if not test_health():
        print("\n⚠️  Webhook server is not running!")
        print("    Start it with: python3 app/webhooks/dm_webhook_server.py")
        exit(1)
    
    # Run tests
    test_crc_challenge()
    test_dm_webhook()
    test_view_dms()
    
    print("\n" + "=" * 60)
    print("✅ ALL WEBHOOK TESTS PASSED")
    print("=" * 60)
    print("\n💡 Next steps:")
    print("   1. Expose webhook via ngrok: ngrok http 8081")
    print("   2. Register with X: xurl --auth app /2/webhooks -X POST -d '{\"url\": \"https://YOUR-NGROK-URL/webhooks\"}'")
    print("   3. Wait for real candidate DMs!")

