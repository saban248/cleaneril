
from api.integrations.google_ads import build_google_oauth_url
from api.integrations.ptc import AppIntegration
from flask import session, abort, redirect

from api.ptc import SJson
from api.validator import core_msg


def get_integrations_api(integration:int, breq: dict):
    integration = int(breq.get("action", -1))
    __success__ = core_msg.ServerCode.success

    match integration:
        case AppIntegration.GOOGLE_ADS:
            return SJson.auto_code(__success__, **{"redirect":build_google_oauth_url()})

    return ''

def set_interactions_api(integration:int, breq: dict):
    __success__ = core_msg.ServerCode.success
    __error__ = core_msg.ServerCode.General.something_wrong
    integration = int(integration)
    last_state = session.get(f"stat_oauth_{integration}")
    session.pop(f"oauth_state_{integration}", None)
    match integration:
        case AppIntegration.GOOGLE_ADS:
            error = breq.get("error", core_msg.ServerMsg[__error__] or str())
            state = breq.get("state")
            code = breq.get("code")
            last_state = session.get(f"stat_oauth_{integration}")
            if (not code or state) or (last_state is None or last_state != state):
                return abort(400)

            if error:
                return redirect(f"/?show=integration&error={error}")

    abort(400)