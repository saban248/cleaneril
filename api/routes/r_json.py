import base64
import time
from datetime import datetime
import json
import os
from zoneinfo import ZoneInfo
from flask import session, request
import api.databases.company as companies
from api.api_action import get_api_action, api_upload_file, get_register_action
from api.databases.bridge import upgrade_from_clients_to_clean_order
from api.databases.employee import Employee
from api.databases.manager import ApiManager
from api.databases.ptc import cleaneril, ServerConfig, StateOrder
from api.ptc import ShortSession, SJson, get_dictionary_http, generate_hex
from api.routes.general import set_session_data_admin
from api.routes.ptc import RouteApi, RegisterApi
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
    manager = ApiManager.get_managers(False, **breq).first()
    _company = companies.get_companies(manager_id=manager.manager_id).first()
    if _company.register_level != RegisterApi.DONE:
        return SJson.auto_code(core_msg.ServerCode.Register.register_not_finished)

    # UPGRADES
    set_session_data_admin(session,manager)
    upgrade_from_clients_to_clean_order(manager.manager_id)
    # done
    return SJson.auto_code(__success__)


@cleaneril.route(RouteApi.api.path, methods=["POST"])
def api():
    if not ShortSession.is_admin(session):
        return SJson.auto_code(core_msg.ServerCode.General.access_denied)

    breq = get_dictionary_http(request)
    sjson = get_api_action(request, **breq)
    return sjson



@cleaneril.route(RouteApi.up_image.path, methods=["POST"])
def up_image():
    data = request.json
    response = api_upload_file(data)

    return response

@cleaneril.route(RouteApi.register.path, methods=["POST"])
def register():
    breq = get_dictionary_http(request)
    get_ac = get_register_action(**breq)
    return get_ac
