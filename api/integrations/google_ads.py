import secrets
from urllib.parse import urlencode
from flask import session
from api.databases.ptc import ServerConfig

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"


def build_google_oauth_url():
    state = secrets.token_urlsafe(32)
    session["google_oauth_state"] = state
    params = {
        "client_id": ServerConfig.google_client_id,
        "redirect_uri": ServerConfig.google_redirect_uri,
        "response_type": "code",
        "scope": " ".join(ServerConfig.google_permission_scopes),
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }

    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

