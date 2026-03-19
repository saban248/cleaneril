import base64
import time
from datetime import datetime
import json
import os
from zoneinfo import ZoneInfo
from flask import session, request

from api.api_action import get_api_action, api_upload_file, get_register_action
from api.databases.employee import Employee
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

@cleaneril.template_filter("eper")
def employee_permission(employee:Employee, flag:int):
    return flag & employee.permission


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
    details = ApiManager.get_managers(False, **breq).first().__dict__
    del details["_sa_instance_state"]
    ShortSession.set_admin_details(session, details)
    return SJson.success()


@cleaneril.route(RouteApi.api.path, methods=["POST"])
def api():
    if not ShortSession.is_admin(session):
        return SJson.error()

    breq = get_dictionary_http(request)
    get_ac = get_api_action(session, request, **breq)

    return SJson.success(**get_ac)



@cleaneril.route(RouteApi.up_image.path, methods=["POST"])
def up_image():
    data = request.json
    response = api_upload_file(session, data)

    return response

@cleaneril.route(RouteApi.register.path, methods=["POST"])
def register():
    breq = get_dictionary_http(request)
    get_ac = get_register_action(session, **breq)
    return SJson.success(**get_ac)
