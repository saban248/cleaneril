import base64
import json
import os
from time import sleep

from flask import render_template_string, render_template
from flask_wtf.csrf import validate_csrf

from api.databases import orders, clients
from api.databases.bridge import set_employee_to_client, on_create_order_create_client
from api.databases.clients import ClientProfile
from api.databases.company import ApiCompany
from api.databases.crads import ApiCards, Cards
from api.databases.employee import ApiEmployee, Employee
from api.databases.funds import ApiFunds
from api.databases.invoice import ApiInvoice, Invoice
from api.databases.manager import ApiManager, on_register_create_company
from api.databases.orders import CleanOrder
from api.databases.ptc import StateDocument, ServerConfig, cleaneril
from api.ptc import special_things, SJson, ShortSession
from api.routes.ptc import Pages, ApiCall, ApiUploadFile, RegisterApi, PaymentInvoice
from api.validator import core_msg, company
from api.routes import cil_struct

def get_api_action(session, request, **breq) -> dict:
    action = int(breq.get("action", -1))
    manager = ShortSession.get_admin_details(session)
    manager_id = manager["manager_id"]
    match action:
        case ApiCall.card_editor:
            card = cil_struct.CardEditor().build(**breq)
            return {"template":get_card_edit_template(card.ci)}
        case ApiCall.order_edit:
            r_order = cil_struct.CleanOrder().build(**breq)
            order: CleanOrder = orders.get_clean_orders(manager_id=manager_id, order_id=r_order.oi).first()
            return {"template":get_client_order_template(manager, order), "order_id":order.order_id}
        case ApiCall.client_view:
            client = cil_struct.Client().build(**breq)
            return {"template":get_client_template(manager_id, client.cid)}
        case ApiCall.order_save:
            r_order = cil_struct.CleanOrder().build(**breq)
            order = orders.update_clean_order(manager_id, r_order.client_id,r_order)
            on_create_order_create_client(order)
            return {}
        case ApiCall.order_new:
            r_order = cil_struct.CleanOrder().build(**breq)
            order = orders.create_clean_order(manager_id,r_order.client_id, r_order)
            return {"template":get_client_order_template(manager, order,True), "order_id":order.order_id}
        case ApiCall.order_view:
            od = cil_struct.CleanOrder().build(**breq)
            order:CleanOrder = orders.get_clean_orders(manager_id=manager_id, order_id=od.oi).first()
            if order:
                return {"template": get_client_order_template(manager, order, False), "order_id":order.order_id}
            return {"success":False, "notice":"שגיאה בהצגת לקוח"}
        case ApiCall.card_draft | ApiCall.card_save:
            if ApiCall.card_draft&action:state = StateDocument.DRAFT
            else: state = StateDocument.SAVED
            card = cil_struct.CardEditor().build(**breq)
            _stat_ = ApiCards.add_card(card.ci,state,card.ct,card.o,
                              card.op,card.imp,card.desc,card.wt, card.wtl,card.phone)
            return {"card_id":card.ci}
        case ApiCall.card_delete:
            card = cil_struct.CardEditor().build(**breq)
            return  {"deleted":ApiCards.delete_card(card_id=card.ci)}
        case ApiCall.order_delete:
            rroder = cil_struct.CleanOrder().build(**breq)
            return {"success":bool(not orders.delete_clean_order(manager_id, rroder.oi))}
        case ApiCall.order_stat:
            r_order = cil_struct.CleanOrder().build(**breq)
            return {"stated":orders.set_clean_order_stat(manager_id, order_id=r_order.oi, stat=r_order.s)}
        case ApiCall.funds_income:
            funds = cil_struct.Funds().build(**breq)
            api_f = ApiFunds(manager_id)
            data = {"data": api_f.get_order_profit_years(funds.year),
                    "in":api_f.fi,
                    "ex":api_f.fe,
                    "pr":api_f.pf,
                    "ave_ipc_ever":api_f.get_average_income_per_client_ever(),
                    "ave_epc_ever":api_f.get_average_expense_per_client_ever(),
                    "total_client":len(api_f.od)}
            return data
        case ApiCall.conf_company:
            config = cil_struct.Company().build(**breq)
            state = ApiCompany.update_company_details(manager_id, config.c_name,config.c_owner, config.c_vat,
                                              config.c_desc,config.c_phone, config.c_email, config.c_vat_code,
                                                      config.c_gpse)
            return {"success":bool(not state)}
        case ApiCall.order_workers:
            workers = list(ApiEmployee.get_employees_search(manager_id=manager_id))
            return {"workers":workers}
        case ApiCall.worker_editor:
            worker = cil_struct.Employee().build(**breq)
            return {"template": get_worker_template(manager, worker.wid)}
        case ApiCall.worker_view:
            worker = cil_struct.Employee().build(**breq)
            return {"template": get_worker_template(manager, worker.wid, False)}
        case ApiCall.worker_save:
            worker = cil_struct.Employee().build(**breq)
            empl = ApiEmployee.add_employee(worker.e_name, worker.e_pwd, manager_id, worker.wid,
                                               worker.permission,worker.e_phone,worker.e_idc, worker.ps, worker.pvat)
            return {"success":bool(empl)}
        case ApiCall.worker_delete:
            worker = cil_struct.Employee().build(**breq)
            _state_ = ApiEmployee.delete_employee(manager_id, worker.wid)
            return {"success":bool(not _state_)}
        case ApiCall.calendar:
            calendar = cil_struct.Calendar().build(**breq)
            # clients = ApiClients.get_clients_by_calendar_date(calendar.month, calendar.year)
            return {"data":[]}
        case ApiCall.orders_list:
            data = cil_struct.ListOrders().build(**breq)
            _orders = orders.get_clean_order_latest(False, manager_id=manager_id)
            return {"orders":_orders}
        case ApiCall.invoice_view:
            inv = cil_struct.Invoice().build(**breq)
            return {"template":get_invoice_template(manager_id, inv.iid)}
        case ApiCall.invoice_create:
            inv = cil_struct.Invoice().build(**breq)
            # client = ApiClients.get_clients(client_id=inv.cid).first()
            # invoice = ApiInvoice.create_invoice(manager_id,client, PaymentInvoice.CASH)
            return {"success":bool(not inv)}
        case ApiCall.invoice_list:
            invoices = ApiInvoice.get_invoices_list()
            return {"invoices":invoices}
        case ApiCall.list_clients:
            _clients = clients.get_clients(False, manager_id=manager_id)
            return {"clients":_clients}

    return {}


def get_register_action(session, **breq):
    action = int(breq.get("action", -1))
    register = cil_struct.Register().build(**breq)
    match action:
        case RegisterApi.level1:
            user = company.username(register.username)
            if user:return SJson.error(user)
            pwd = company.password(register.password)
            if pwd:return SJson.error(pwd)
            stat = on_register_create_company(register.username, register.password)
            if stat:
                return SJson.error(stat)
            return {"success":not stat,
                    "mid":ApiManager.get_managers(username=register.username, password=register.password).first().manager_id}
        case RegisterApi.level2:
            manager = ApiManager.get_managers(manager_id=register.mid).first()
            if not manager:
                return {"success":False}
            name = company.name(register.c_name)
            if name:return SJson.error(name)
            exist = ApiCompany.get_companies(company_name=register.c_name).first()
            if exist:return SJson.error(core_msg.Company.exist_name)
            desc = company.description(register.c_desc)
            if desc:return SJson.error(desc)
            phone = company.phone(register.c_phone)
            if phone:return SJson.error(phone)
            fullname = company.ownername(register.o_name)
            if fullname:return SJson.error(fullname)
            stat = ApiCompany.update_company_details(register.mid,register.c_name,None,None,
                                                     register.c_desc,register.c_phone, None)
            return {"success":bool(not stat)}


    return {}


def get_card_edit_template(card_id:str, **_):
    card:Cards = ApiCards.create_card(card_id=card_id)
    return render_template(f"{Pages.home.path}card_ba.html",
                           editor=True,card=card,
                           special=special_things
                       )

def get_client_order_template(manager, order:CleanOrder, edit:bool = True, **_):
    company = ApiCompany.get_companies(manager_id=manager["manager_id"]).first()
    print(order.items)
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


def get_invoice_template(manager_id:str, iid):
    company = ApiCompany.get_companies(manager_id=manager_id).first()
    invoice:Invoice = ApiInvoice.get_invoices(invoice_id=iid).first()
    invoice.order = json.loads(invoice.order)
    return render_template(Pages.invoice.f_dashboard, company=company, invoice=invoice)

def api_upload_file(session, data:dict):
    flag = int(data.get("action", -1))

    filename = data["filename"]
    img_data = data["data"]
    image_bytes = base64.b64decode(img_data)
    manager_id: str = ShortSession.get_admin_details(session).get("manager_id") or data.get("mid")
    match flag:
        case ApiUploadFile.CARD:
            if not ShortSession.is_admin(session):
                return SJson.error()
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    str(os.path.join(ServerConfig.FOLDER_IMAGE_BA, filename)))
            if ServerConfig.DEFAULT_IMAGE_CARD == fullpath: return SJson.success()

            with open(fullpath, "wb") as f:
                f.write(image_bytes)
        case ApiUploadFile.LOGO:
            exist = ApiManager.get_managers(manager_id=manager_id).first()
            if not exist:
                return SJson.error()
            name = manager_id+".png"
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    os.path.join(ServerConfig.FOLDER_LOGOS_PATH, name))
            with open(fullpath, "wb") as f:
                f.write(image_bytes)

            ApiCompany.change_logo(manager_id, name)


    return SJson.success()
