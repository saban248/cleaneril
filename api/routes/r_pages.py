import binascii
import json
import os

from flask import session, request, jsonify, render_template, redirect, url_for, abort

from api.databases.clients import ApiClients
from api.databases.crads import ApiCards
from api.databases.ptc import cleaneril, ServerConfig
from api.ptc import special_things, SJson, ShortSession
from api.routes.ptc import RoutePages, Pages


@cleaneril.route(RoutePages.home.path, methods=['GET'])
@cleaneril.route("/", methods=['GET'])
def home():
    return render_template(str(Pages.home.html),
                           company_name=ServerConfig.COMPANY_NAME,
                           cards=ApiCards.get_cards().all(),
                           special_things=special_things)


@cleaneril.route(RoutePages.auth.path, methods=['GET'])
def auth():
    e_invalid = SJson.error()
    if ShortSession.is_admin(session):
        return redirect(url_for('dashboard'))

    return render_template(Pages.auth.html, company_name=ServerConfig.COMPANY_NAME)


@cleaneril.route(RoutePages.dashboard.path, methods=["GET"])
def dashboard():
    e_invalid = SJson.error()
    if not ShortSession.is_admin(session):
        return redirect(url_for("auth"))
    return render_template(Pages.dashboard.html,
                           cards=list(reversed(ApiCards.get_cards(False).all())),
                           clients=list(reversed(ApiClients.get_clients(False).all())))