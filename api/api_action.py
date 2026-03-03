import base64
import os

from flask import render_template_string, render_template

from api.databases.clients import Clients, ApiClients
from api.databases.company import ApiCompany
from api.databases.crads import ApiCards, Cards
from api.databases.funds import ApiFunds
from api.databases.ptc import StateDocument, ServerConfig, cleaneril
from api.ptc import special_things, SJson, ShortSession
from api.routes.ptc import Pages, ApiCall, ResponseStruct, ApiUploadFile


def get_api_action(session, request, **breq) -> dict:
    action = int(breq.get("action", -1))
    manager = ShortSession.get_admin_details(session)
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
                                           client.lf,client.notes,client.price,client.vat, client.ex)
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
            manager = ShortSession.get_admin_details(session)
            state = ApiCompany.update_company_details(manager["manager_id"], config.c_name,config.c_owner, config.c_vat,
                                              config.c_desc,config.c_phone, config.c_email, config.c_vat_code)
            return {"success":bool(not state)}

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




def api_upload_file(session, data:dict):
    flag = int(data.get("action", -1))

    filename = data["filename"]
    img_data = data["data"]
    image_bytes = base64.b64decode(img_data)
    match flag:
        case ApiUploadFile.CARD:
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    str(os.path.join(ServerConfig.FOLDER_IMAGE_BA, filename)))
            if ServerConfig.DEFAULT_IMAGE_CARD == fullpath: return SJson.success()

            with open(fullpath, "wb") as f:
                f.write(image_bytes)
        case ApiUploadFile.LOGO:
            manager_id:str = ShortSession.get_admin_details(session)["manager_id"]
            name = manager_id+".png"
            fullpath = os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)),
                                    os.path.join(ServerConfig.FOLDER_LOGOS_PATH, name))
            with open(fullpath, "wb") as f:
                f.write(image_bytes)

            ApiCompany.change_logo(manager_id, name)


    return SJson.success()