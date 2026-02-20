import base64
import time
from datetime import datetime
import json
import os
from zoneinfo import ZoneInfo

from flask import session, request

from api.api_action import get_api_action
from api.databases.manager import ApiManager
from api.databases.ptc import cleaneril, ServerConfig, StateClient
from api.ptc import ShortSession, SJson, get_dictionary_http, generate_hex
from api.routes.ptc import RouteApi, ResponseStruct

# jinja functions
@cleaneril.template_filter("to_dict")
def fromjson(value):
    return json.loads(value)

@cleaneril.template_filter("cda")
def client_date_arrive(ts):
    return datetime.fromtimestamp(ts).strftime("%d.%m.%Y")

@cleaneril.template_filter("cdar")
def client_date_arrive(ts):
    if not ts:
        ts = time.time()
    ts = float(ts)
    if ts > 1e12:
        ts /= 1000

    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")

@cleaneril.template_filter("cdah")
def client_date_arrive_hour(ts):
    ts = float(ts)
    if ts > 1e12:
        ts /= 1000

    return datetime.fromtimestamp(ts, ZoneInfo("Asia/Jerusalem")).strftime("%H:%M")

@cleaneril.template_filter("jrt")
def json_roundtrip(obj):
    return json.loads(obj).items()

@cleaneril.template_filter("ctime")
def get_ctime_from_time(ctime:float):
    return time.ctime(ctime)

@cleaneril.template_filter("cft")
def client_flag_text(flag):
    match flag:
        case StateClient.WAIT:
            return "לא נסגר"
        case StateClient.CANCELED:
            return "בוטל"
        case StateClient.CLOSED:
            return "בהמתנה"
        case StateClient.DONE:
            return "הושלם"


@cleaneril.route(RouteApi.do_auth.path, methods=["POST"])
def authorize():
    if ShortSession.is_admin(session):
        return SJson.success()

    breq = get_dictionary_http(request)
    auth = ResponseStruct.Auth().build(**breq).__dict__
    stat = ApiManager.auth(**auth)
    if stat:
        return SJson.error()

    ShortSession.set_admin(session)
    ShortSession.set_admin_details(session, auth)
    return SJson.success()


@cleaneril.route(RouteApi.api.path, methods=["POST"])
def api():
    if not ShortSession.is_admin(session):
        return SJson.error()

    breq = get_dictionary_http(request)
    get_ac = get_api_action(**breq)

    return SJson.success(**get_ac)



@cleaneril.route(RouteApi.up_image.path, methods=["POST"])
def up_image():
    if not ShortSession.is_admin(session):
        return SJson.error()
    data = request.json
    filename = data["filename"]
    img_data = data["data"]  # base64 string

    image_bytes = base64.b64decode(img_data)
    fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)), str(os.path.join(ServerConfig.FOLDER_IMAGE_BA, filename)))
    if os.path.exists(fullpath):return SJson.success()

    with open(fullpath, "wb") as f:
        f.write(image_bytes)

    return SJson.success()