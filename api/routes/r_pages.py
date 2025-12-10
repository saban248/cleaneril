import binascii
import json
import os

from flask import session, request, jsonify, render_template, redirect, url_for, abort

from api.databases.ptc import cleaneril, ServerConfig
from api.ptc import special_things
from api.routes.ptc import RoutePages, Pages


@cleaneril.route(RoutePages.home.path, methods=['GET'])
@cleaneril.route("/", methods=['GET'])
def home():
    return render_template(str(Pages.home.html),
                           company_name=ServerConfig.COMPANY_NAME,
                           cards=[{"title":"ספה",},{"title":"מזרן"}],
                           special_things=special_things)