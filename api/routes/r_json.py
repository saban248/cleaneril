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
from api.databases.ptc import cleaneril, ServerConfig, StateOrder
from api.ptc import ShortSession, SJson, get_dictionary_http, generate_hex
from api.routes.ptc import RouteApi
from api.routes import cil_struct
from api.validator import core_msg


@cleaneril.route(RouteApi.do_auth.path, methods=["POST"])
def authorize():
    __success__ = core_msg.ServerCode.success
    if ShortSession.is_admin(session):
        return SJson.auto_code(__success__)

    breq = get_dictionary_http(request)
    auth = cil_struct.Auth().build(**breq).__dict__
    code = ApiManager.auth(**auth)
    if code:
        return SJson.auto_code(code)

    ShortSession.set_admin(session)
    details = ApiManager.get_managers(False, **breq).first().__dict__
    del details["_sa_instance_state"]
    ShortSession.set_admin_details(session, details)
    return SJson.auto_code(__success__)


@cleaneril.route(RouteApi.api.path, methods=["POST"])
def api():
    if not ShortSession.is_admin(session):
        return SJson.auto_code(core_msg.ServerCode.General.access_denied)

    breq = get_dictionary_http(request)
    sjson = get_api_action(session, request, **breq)
    return sjson



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
