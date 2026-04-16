import binascii
import json
import os

import markdown
from flask import session, request, jsonify, render_template, redirect, url_for, abort

from api.databases.crads import ApiCards
from api.databases.employee import ApiEmployee
from api.databases.manager import ApiManager
from api.databases.orders import CountOfOrderByStat
from api.databases.ptc import cleaneril, ServerConfig
from api.databases.company import ApiCompany
from api.ptc import special_things, SJson, ShortSession, get_dictionary_http
from api.routes.ptc import RoutePages, Pages
from api.routes import cil_struct


@cleaneril.route(RoutePages.home.path, methods=['GET'])
@cleaneril.route("/", methods=['GET'])
def home():
    return render_template(str(Pages.home.html),
                           company_name=ServerConfig.COMPANY_NAME,
                           cards=ApiCards.get_cards().all(),
                           special_things=special_things)


@cleaneril.route(RoutePages.auth.path, methods=['GET'])
def auth():
    if ShortSession.is_admin(session):
        return redirect(url_for('dashboard'))

    return render_template(Pages.auth.html, company_name=ServerConfig.COMPANY_NAME)


@cleaneril.route(RoutePages.dashboard.path, methods=["GET"])
def dashboard():
    if not ShortSession.is_admin(session):
        return redirect(url_for("auth"))

    breq = get_dictionary_http(request)
    dash = cil_struct.Dashboard().build(**breq)
    manager = ShortSession.get_admin_details(session)
    manager_id = manager["manager_id"]
    company = ApiCompany.get_companies(manager_id=manager_id).first()
    workers = ApiEmployee.get_employees(manager_id=manager_id).all()
    # count_stat_orders
    cso = CountOfOrderByStat()
    return render_template(Pages.dashboard.html,
                           cards=list(reversed(ApiCards.get_cards(False).all())),
                           counts=[cso.wait,cso.done,cso.closed, cso.canceled],
                           company=company,manager=manager, workers=workers)


@cleaneril.route(RoutePages.create_account.path, methods=['GET'])
def create_account():
    # e_invalid = SJson.error()
    # if  ShortSession.is_admin(session):
    #     return redirect(url_for("auth"))

    return render_template(Pages.register.html)


@cleaneril.route(RoutePages.terms.path, methods=["GET"])
def terms_of_services():

    with open(os.path.join(ServerConfig.PAGES_FOLDER, Pages.terms.md), encoding="utf-8") as f:
        md = f.read()
    html = markdown.markdown(
        md,
        extensions=[
            "extra",
            "nl2br",
            "sane_lists"
        ]
    )

    return render_template(Pages.terms.html, terms=html)