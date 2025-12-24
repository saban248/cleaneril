from flask import render_template_string, render_template

from api.databases.clients import Clients, ApiClients
from api.databases.crads import ApiCards, Cards
from api.databases.ptc import StateDocument
from api.ptc import special_things
from api.routes.ptc import Pages, ApiCall, ResponseStruct


def get_api_action(**breq) -> dict:
    action = int(breq.get("action", -1))
    match action:
        case ApiCall.card_editor:
            card = ResponseStruct.CardEditor().build(**breq)
            return {"template":get_card_edit_template(card.ci)}
        case ApiCall.client_editor:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"template":get_client_template(client.ci)}
        case ApiCall.client_view:
            client = ResponseStruct.ClientEditor().build(**breq)
            return {"template":get_client_template(client.ci, False)}
        case ApiCall.client_save:
            client = ResponseStruct.ClientEditor().build(**breq)
            _stat_ = ApiClients.add_client(client.ci,client.s,client.phone,client.i,
                                           client.o,client.op,client.fn,client.date,client.address,
                                           client.lf,client.notes,client.price,client.vat)
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

    return {}

def get_card_edit_template(card_id:str, **_):
    card:Cards = ApiCards.create_card(card_id=card_id)
    return render_template(f"{Pages.home.path}card_ba.html",
                           editor=True,card=card,
                           special=special_things
                       )

def get_client_template(client_id:str, edit:bool = True, **_):
    client:Clients = ApiClients.create_client(client_id)
    return render_template(f'{Pages.dashboard.path}client.html',
                           editor=edit, client=client)



