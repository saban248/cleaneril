
from api.integrations.google_ads import build_google_oauth_url
from api.integrations.ptc import AppIntegration
from flask import session

from api.ptc import SJson
from api.validator import core_msg


def get_integrations_api(breq: dict):
    integration = int(breq.get("action", -1))
    __success__ = core_msg.ServerCode.success

    match integration:
        case AppIntegration.GOOGLE_ADS:
            return SJson.auto_code(__success__, **{"redirect":build_google_oauth_url()})

    return ''