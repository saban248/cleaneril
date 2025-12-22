import base64
import json
import os

from flask import session, request

from api.api_action import get_api_action
from api.databases.manager import ApiManager
from api.databases.ptc import cleaneril, ServerConfig
from api.ptc import ShortSession, SJson, get_dictionary_http, generate_hex
from api.routes.ptc import RouteApi, ResponseStruct

# jinja functions
@cleaneril.template_filter("to_dict")
def fromjson(value):
    return json.loads(value)

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