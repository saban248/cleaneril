import secrets
from urllib.parse import urlencode
from flask import session
from api.databases.ptc import ServerConfig
from api.integrations.ptc import AppIntegration

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"


def build_google_oauth_url():
    state = secrets.token_urlsafe(32)
    session[f"stat_oauth_{AppIntegration.GOOGLE_ADS}"] = state
    params = {
        "client_id": ServerConfig.google_client_id,
        "redirect_uri": ServerConfig.integration_redirect_uri.format(flag=AppIntegration.GOOGLE_ADS.name.lower()),
        "response_type": "code",
        "scope": " ".join(ServerConfig.google_permission_scopes),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "include_granted_scopes": "true"
    }

    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

