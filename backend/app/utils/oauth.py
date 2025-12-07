import base64
import hashlib
import hmac
import secrets
import time
from urllib.parse import quote
from typing import Dict

def create_oauth_signature(method: str, url: str, params: Dict, consumer_secret: str, token_secret: str) -> str:
    """Create OAuth 1.0a signature"""
    # Sort parameters
    sorted_params = sorted(params.items())
    param_string = "&".join([f"{quote(str(k), safe='')}={quote(str(v), safe='')}" for k, v in sorted_params])
    
    # Create signature base string
    base_string = f"{method}&{quote(url, safe='')}&{quote(param_string, safe='')}"
    
    # Create signing key
    signing_key = f"{quote(consumer_secret, safe='')}&{quote(token_secret, safe='')}"
    
    # Create signature
    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()
    
    return signature

def create_oauth_params(consumer_key: str, access_token: str) -> Dict:
    """Create OAuth 1.0a parameters"""
    return {
        "oauth_consumer_key": consumer_key,
        "oauth_token": access_token,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_nonce": secrets.token_hex(16),
        "oauth_version": "1.0"
    }

def create_oauth_header(oauth_params: Dict) -> str:
    """Create OAuth 1.0a authorization header"""
    return "OAuth " + ", ".join([f'{k}="{quote(str(v), safe="")}"' for k, v in oauth_params.items()])

def create_oauth_request(method: str, url: str, consumer_key: str, consumer_secret: str, 
                        access_token: str, access_token_secret: str) -> str:
    """Create complete OAuth 1.0a authorization header for a request"""
    # Create OAuth parameters
    oauth_params = create_oauth_params(consumer_key, access_token)
    
    # Create signature
    signature = create_oauth_signature(method, url, oauth_params, consumer_secret, access_token_secret)
    oauth_params["oauth_signature"] = signature
    
    # Create authorization header
    return create_oauth_header(oauth_params)