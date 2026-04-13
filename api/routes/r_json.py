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
from api.routes.ptc import RouteApi, ResponseStruct


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
