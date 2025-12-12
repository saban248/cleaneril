from flask import session, request

from api.api_action import get_api_action
from api.databases.manager import ApiManager
from api.databases.ptc import cleaneril
from api.ptc import ShortSession, SJson, get_dictionary_http
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
    ShortSession.set_admin_details(session, auth)
    return SJson.success()


@cleaneril.route(RouteApi.api.path, methods=["POST"])
def api():
    if not ShortSession.is_admin(session):
        return SJson.error()

    breq = get_dictionary_http(request)
    res_call = ResponseStruct.Api().build(**breq)
    get_ac = get_api_action(res_call.action, res_call)

    return SJson.success(**get_ac)


