import base64
import json
import os
from time import sleep

from flask import render_template_string, render_template

from api.data.ptc import AnalyticsData
from api.databases import invoice
from api.databases import orders, clients
from api.databases.bridge import set_employee_to_client, on_create_order_create_client
from api.databases.clients import ClientProfile
from api.databases.company import ApiCompany
from api.databases.crads import ApiCards, Cards
from api.databases.employee import ApiEmployee, Employee
from api.databases.manager import ApiManager, on_register_create_company
from api.databases.orders import CleanOrder
from api.databases.ptc import StateDocument, ServerConfig, cleaneril
from api.ptc import special_things, SJson, ShortSession
from api.routes.cil_struct import ReportsDataAnalyze
from api.routes.ptc import Pages, ApiCall, ApiUploadFile, RegisterApi, PaymentInvoice, ReportsApi
from api.validator import core_msg, company
from api.routes import cil_struct

def get_api_action(session, request, **breq) -> dict:
    action = int(breq.get("action", -1))
    manager = ShortSession.get_admin_details(session)
    manager_id = manager["manager_id"]
    __success__ = core_msg.ServerCode.success
    match action:
        case ApiCall.card_editor:
            card = cil_struct.CardEditor().build(**breq)
            return SJson.auto_code(__success__, **{"template": get_card_edit_template(card.ci)})
        case ApiCall.order_edit:
            r_order = cil_struct.CleanOrder().build(**breq)
            order: CleanOrder = orders.get_clean_orders(manager_id=manager_id, order_id=r_order.oi).first()
            template =  {"template":get_client_order_template(manager, order), "order_id":order.order_id}
            return SJson.auto_code(__success__, **template)
        case ApiCall.client_view:
            client = cil_struct.Client().build(**breq)
            template = {"template":get_client_template(manager_id, client.cid)}
            return SJson.auto_code(__success__, **template)
        case ApiCall.order_save:
            r_order = cil_struct.CleanOrder().build(**breq)
            order = orders.update_clean_order(manager_id, r_order.client_id,r_order)
            on_create_order_create_client(order)
            return SJson.auto_code(__success__)
        case ApiCall.order_new:
            r_order = cil_struct.CleanOrder().build(**breq)
            order = orders.create_clean_order(manager_id,r_order.client_id, r_order)
            template = {"template":get_client_order_template(manager, order,True), "order_id":order.order_id}
            return SJson.auto_code(__success__, **template)
        case ApiCall.order_view:
            od = cil_struct.CleanOrder().build(**breq)
            order:CleanOrder = orders.get_clean_orders(manager_id=manager_id, order_id=od.oi).first()
            if not order:
                return SJson.auto_code(core_msg.ServerCode.General.something_wrong)
            template = {"template": get_client_order_template(manager, order, False), "order_id":order.order_id}
            return SJson.auto_code(__success__, **template)

        case ApiCall.card_draft | ApiCall.card_save:
            if ApiCall.card_draft&action:state = StateDocument.DRAFT
            else: state = StateDocument.SAVED
            card = cil_struct.CardEditor().build(**breq)
            ApiCards.add_card(card.ci,state,card.ct,card.o,
                              card.op,card.imp,card.desc,card.wt, card.wtl,card.phone)
            return SJson.auto_code(__success__, **{"card_id": card.ci})

        case ApiCall.card_delete:
            card = cil_struct.CardEditor().build(**breq)
            code = ApiCards.delete_card(card_id=card.ci)
            return SJson.auto_code(code)
        case ApiCall.order_delete:
            rroder = cil_struct.CleanOrder().build(**breq)
            code = orders.delete_clean_order(manager_id, rroder.oi)
            return SJson.auto_code(code)
        case ApiCall.order_stat:
            r_order = cil_struct.CleanOrder().build(**breq)
            code = orders.set_clean_order_stat(manager_id, order_id=r_order.oi, stat=r_order.s)
            return SJson.auto_code(code)
        case ApiCall.api_reports:
            return get_app_reports_api(session,request,**breq)

        case ApiCall.conf_company:
            config = cil_struct.Company().build(**breq)
            code = ApiCompany.update_company_details(manager_id, config.c_name,config.c_owner, config.c_vat,
                                              config.c_desc,config.c_phone, config.c_email, config.c_vat_code,
                                                      config.c_gpse)
            return SJson.auto_code(code)

        case ApiCall.order_workers:
            workers = list(ApiEmployee.get_employees_search(manager_id=manager_id))
            return SJson.auto_code(__success__, **{"workers": workers})
        case ApiCall.worker_editor:
            worker = cil_struct.Employee().build(**breq)
            template =  {"template": get_worker_template(manager, worker.wid)}
            return SJson.auto_code(__success__, **template)
        case ApiCall.worker_view:
            worker = cil_struct.Employee().build(**breq)
            template = {"template": get_worker_template(manager, worker.wid, False)}
            return SJson.auto_code(__success__, **template)
        case ApiCall.worker_save:
            worker = cil_struct.Employee().build(**breq)
            code = ApiEmployee.add_employee(worker.e_name, worker.e_pwd, manager_id, worker.wid,
                                               worker.permission,worker.e_phone,worker.e_idc, worker.ps, worker.pvat)
            return SJson.auto_code(core_msg.ServerCode.success if code else core_msg.ServerCode.General.something_wrong)

        case ApiCall.worker_delete:
            worker = cil_struct.Employee().build(**breq)
            code = ApiEmployee.delete_employee(manager_id, worker.wid)
            return SJson.auto_code(code)

        case ApiCall.calendar:
            calendar = cil_struct.Calendar().build(**breq)
            # clients = ApiClients.get_clients_by_calendar_date(calendar.month, calendar.year)
            data = {"data": []}
            return SJson.auto_code(__success__, **data)

        case ApiCall.orders_list:
            data = cil_struct.ListOrders().build(**breq)
            _orders = {"orders":orders.get_clean_order_latest(False, manager_id=manager_id)}
            return SJson.auto_code(__success__, **_orders)

        case ApiCall.invoice_view:
            inv = cil_struct.Invoice().build(**breq)
            receipt = invoice.get_receipts(manager_id=manager_id, receipt_id=inv.iid).first()
            if not receipt:
                return SJson.auto_code(core_msg.ServerCode.General.something_wrong)
            template = {"template":get_invoice_template(manager_id, receipt)}
            return SJson.auto_code(__success__, **template)

        case ApiCall.invoice_create:
            inv = cil_struct.Invoice().build(**breq)
            code = invoice.create_receipt(manager_id,inv.cid,inv.oid,inv.stat, inv.pt)
            return SJson.auto_code(code)

        case ApiCall.invoice_list:
            invoices = invoice.get_receipts(False, manager_id=manager_id)
            receipts =  {"invoices":invoices}
            return SJson.auto_code(__success__, **receipts)

        case ApiCall.invoice_delete:
            inv = cil_struct.Invoice().build(**breq)
            code = invoice.delete_receipt(manager_id, inv.iid)
            return SJson.auto_code(code)

        case ApiCall.list_clients:
            _clients = clients.get_clients(False, manager_id=manager_id)
            lclients =  {"clients":_clients}
            return SJson.auto_code(__success__, **lclients)

    return SJson.auto_code(__success__)



def get_app_reports_api(session, request, **breq) -> dict:
    manager = ShortSession.get_admin_details(session)
    manager_id = manager["manager_id"]
    __success__ = core_msg.ServerCode.success
    reports = cil_struct.Reports().build(**breq)
    action = reports.rAction or -1
    analyze = AnalyticsData(manager_id, reports.df, reports.dt)
    struct = ReportsDataAnalyze()
    match action:
        case ReportsApi.funds:
            struct.ie = analyze.income_ever()
            struct.i = analyze.income()
            struct.ee = analyze.expenses_ever()
            struct.e = analyze.expenses()
            struct.aioe = analyze.get_average_income_orders_ever()
            struct.aio = analyze.get_average_income_orders()
            struct.aeoe = analyze.get_average_expense_orders_ever()
            struct.aeo = analyze.get_average_expense_orders()
            struct.odce = analyze.orders_done_count_ever()
            struct.odc = len(analyze.orders_done())
            struct.occe = analyze.orders_canceled_count_ever()
            struct.occ = analyze.orders_canceled_count()
            struct.cico = analyze.count_items_clean_orders()
            struct.cicoe = analyze.count_items_clean_orders_ever()
            struct.code = analyze.count_orders_done_ever()
            struct.cod = analyze.count_orders_done()
            struct.ccre = analyze.count_client_repeated_ever()
            struct.ccr = analyze.count_client_repeated()
            return SJson.auto_code(__success__, **struct.__dict__)
        case ReportsApi.orders:...
        case ReportsApi.graph_funds:
            struct.graph_funds = analyze.get_graph_funds(reports.year)
            return SJson.auto_code(__success__, **struct.__dict__)
        case ReportsApi.graph_orders:
            struct.graph_orders = analyze.get_graph_orders(reports.year)
            return SJson.auto_code(__success__, **struct.__dict__)

    return SJson.auto_code(__success__)



def get_register_action(session, **breq):
    action = int(breq.get("action", -1))
    register = cil_struct.Register().build(**breq)
    match action:
        case RegisterApi.level1:
            user = company.username(register.username)
            if user:return SJson.auto_code(user)
            pwd = company.password(register.password)
            if pwd:return SJson.auto_code(pwd)
            stat = on_register_create_company(register.username, register.password)
            if stat:
                return SJson.auto_code(stat)
            return {"success":not stat,
                    "mid":ApiManager.get_managers(username=register.username, password=register.password).first().manager_id}
        case RegisterApi.level2:
            manager = ApiManager.get_managers(manager_id=register.mid).first()
            if not manager:
                return {"success":False}
            name = company.name(register.c_name)
            if name:return SJson.auto_code(name)
            exist = ApiCompany.get_companies(company_name=register.c_name).first()
            if exist:return core_msg.ServerCode.Register.e_account_exist
            desc = company.description(register.c_desc)
            if desc:return SJson.auto_code(desc)
            phone = company.phone(register.c_phone)
            if phone:return SJson.auto_code(phone)
            fullname = company.ownername(register.o_name)
            if fullname:return SJson.auto_code(fullname)
            stat = ApiCompany.update_company_details(register.mid,register.c_name,None,None,
                                                     register.c_desc,register.c_phone, None)
            return SJson.auto_code(stat)


    return {}


def get_card_edit_template(card_id:str, **_):
    card:Cards = ApiCards.create_card(card_id=card_id)
    return render_template(f"{Pages.home.path}card_ba.html",
                           editor=True,card=card,
                           special=special_things
                       )

def get_client_order_template(manager, order:CleanOrder, edit:bool = True, **_):
    company = ApiCompany.get_companies(manager_id=manager["manager_id"]).first()
    return render_template(f'{Pages.dashboard.path}order.html',
                           editor=edit, order=order, manager=manager, company=company)

def get_client_template(manager_id:str, client_id:str):
    client: ClientProfile = clients.get_clients(manager_id=manager_id, client_id=client_id).first()
    return render_template(f'{Pages.dashboard.path}client.html', client=client)


def get_worker_template(manager, worker_id:str, edit:bool = True, **_):
    manager_id = manager["manager_id"]
    worker:Employee = ApiEmployee.create_employee(worker_id, manager_id)
    company = ApiCompany.get_companies(manager_id=manager_id).first()
    return render_template(f'{Pages.dashboard.path}worker.html',
                           editor=edit, worker=worker, manager=manager, company=company)


def get_invoice_template(manager_id:str, receipt):
    company = ApiCompany.get_companies(manager_id=manager_id).first()
    order = orders.get_clean_orders(manager_id=manager_id, order_id=receipt.order_id).first()
    return render_template(Pages.invoice.f_dashboard, company=company, invoice=receipt, order=order)

def api_upload_file(session, data:dict):
    flag = int(data.get("action", -1))

    filename = data["filename"]
    img_data = data["data"]
    image_bytes = base64.b64decode(img_data)
    manager_id: str = ShortSession.get_admin_details(session).get("manager_id") or data.get("mid")
    match flag:
        case ApiUploadFile.CARD:
            if not ShortSession.is_admin(session):
                return SJson.auto_code(core_msg.ServerCode.General.access_denied)
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    str(os.path.join(ServerConfig.FOLDER_IMAGE_BA, filename)))
            if ServerConfig.DEFAULT_IMAGE_CARD == fullpath: return SJson.auto_code(core_msg.ServerCode.success)

            with open(fullpath, "wb") as f:
                f.write(image_bytes)
        case ApiUploadFile.LOGO:
            exist = ApiManager.get_managers(manager_id=manager_id).first()
            if not exist:
                return SJson.auto_code(core_msg.ServerCode.General.access_denied)
            name = manager_id+".png"
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    os.path.join(ServerConfig.FOLDER_LOGOS_PATH, name))
            with open(fullpath, "wb") as f:
                f.write(image_bytes)

            ApiCompany.change_logo(manager_id, name)


    return SJson.auto_code(core_msg.ServerCode.success)
