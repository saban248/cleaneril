import base64
import os
from time import sleep

from flask import render_template_string, render_template
from flask_wtf.csrf import validate_csrf

from api.databases.bridge import set_employee_to_client
from api.databases.clients import Clients, ApiClients
from api.databases.company import ApiCompany
from api.databases.crads import ApiCards, Cards
from api.databases.employee import ApiEmployee, Employee
from api.databases.funds import ApiFunds
from api.databases.manager import ApiManager, on_register_create_company
from api.databases.ptc import StateDocument, ServerConfig, cleaneril
from api.ptc import special_things, SJson, ShortSession
from api.routes.ptc import Pages, ApiCall, ResponseStruct, ApiUploadFile, RegisterApi
from api.validator import core_msg, company

def get_api_action(session, request, **breq) -> dict:
    action = int(breq.get("action", -1))
    manager = ShortSession.get_admin_details(session)
    manager_id = manager["manager_id"]
    match action:
        case ApiCall.card_editor:
            card = ResponseStruct.CardEditor().build(**breq)
            return {"template":get_card_edit_template(card.ci)}
        case ApiCall.client_editor:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"template":get_client_template(manager, client.ci)}
        case ApiCall.client_view:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"template":get_client_template(manager, client.ci, False)}
        case ApiCall.client_save:
            client = ResponseStruct.ClientEditor().build(**breq)

            _stat_ = ApiClients.add_client(client.ci,client.s,client.phone,client.i,
                                           client.o,client.op,client.fn,client.date,client.address,
                                           client.lf,client.notes,client.price,client.vat, client.ex,
                                           set_employee_to_client(client.worker, manager_id), client.ps,
                                           client.coordinate)
            return {'client_id':client.ci}
        case ApiCall.card_draft | ApiCall.card_save:
            if ApiCall.card_draft&action:state = StateDocument.DRAFT
            else: state = StateDocument.SAVED
            card = ResponseStruct.CardEditor().build(**breq)
            _stat_ = ApiCards.add_card(card.ci,state,card.ct,card.o,
                              card.op,card.imp,card.desc,card.wt, card.wtl,card.phone)
            return {"card_id":card.ci}
        case ApiCall.card_delete:
            card = ResponseStruct.CardEditor().build(**breq)
            return  {"deleted":ApiCards.delete_card(card_id=card.ci)}
        case ApiCall.client_delete:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"deleted":ApiClients.delete_client(client_id=client.ci)}
        case ApiCall.client_state:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"stated":ApiClients.set_state(client_id=client.ci, state=client.s)}
        case ApiCall.funds_income:
            funds = ResponseStruct.Funds().build(**breq)
            data = {"data":ApiFunds.get_client_profit_years(funds.year),
                    "in":ApiFunds.get_income_funds(),
                    "ex":ApiFunds.get_expense_funds(),
                    "pr":ApiFunds.get_profit_funds(),
                    "ave_ipc_ever":ApiFunds.get_average_income_per_client_ever(),
                    "ave_epc_ever":ApiFunds.get_average_expense_per_client_ever(),
                    "total_client":len(ApiFunds.get_done_client())}
            return data
        case ApiCall.conf_company:
            config = ResponseStruct.Company().build(**breq)
            state = ApiCompany.update_company_details(manager_id, config.c_name,config.c_owner, config.c_vat,
                                              config.c_desc,config.c_phone, config.c_email, config.c_vat_code,
                                                      config.c_gpse)
            return {"success":bool(not state)}
        case ApiCall.client_workers:
            workers = list(ApiEmployee.get_employees_search(manager_id=manager_id))
            return {"workers":workers}
        case ApiCall.worker_editor:
            worker = ResponseStruct.Employee().build(**breq)
            return {"template": get_worker_template(manager, worker.wid)}
        case ApiCall.worker_view:
            worker = ResponseStruct.Employee().build(**breq)
            return {"template": get_worker_template(manager, worker.wid, False)}
        case ApiCall.worker_save:
            worker = ResponseStruct.Employee().build(**breq)
            empl = ApiEmployee.add_employee(worker.e_name, worker.e_pwd, manager_id, worker.wid,
                                               worker.permission,worker.e_phone,worker.e_idc, worker.ps, worker.pvat)
            return {"success":bool(empl)}
        case ApiCall.worker_delete:
            worker = ResponseStruct.Employee().build(**breq)
            _state_ = ApiEmployee.delete_employee(manager_id, worker.wid)
            return {"success":bool(not _state_)}
        case ApiCall.calendar:
            calendar = ResponseStruct.Calendar().build(**breq)
            clients = ApiClients.get_clients_by_calendar_date(calendar.month, calendar.year)
            return {"data":clients}
        case ApiCall.client_list:
            data = ResponseStruct.ListClients().build(**breq)
            clients = ApiClients.get_clients_list(data.fromY,data.toY)
            return {"clients":clients}


    return {}


def get_register_action(session, **breq):
    action = int(breq.get("action", -1))
    register = ResponseStruct.Register().build(**breq)
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

def get_client_template(manager, client_id:str, edit:bool = True, **_):
    client:Clients = ApiClients.create_client(client_id)
    company = ApiCompany.get_companies(manager_id=manager["manager_id"]).first()
    return render_template(f'{Pages.dashboard.path}client.html',
                           editor=edit, client=client, manager=manager, company=company)


def get_worker_template(manager, worker_id:str, edit:bool = True, **_):
    manager_id = manager["manager_id"]
    worker:Employee = ApiEmployee.create_employee(worker_id, manager_id)
    company = ApiCompany.get_companies(manager_id=manager_id).first()
    return render_template(f'{Pages.dashboard.path}worker.html',
                           editor=edit, worker=worker, manager=manager, company=company)



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
