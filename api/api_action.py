from flask import render_template_string, render_template

from api.databases.crads import ApiCards, Cards
from api.ptc import special_things
from api.routes.ptc import Pages, ApiCall, ResponseStruct


def get_api_action(action:ApiCall, res_call:ResponseStruct.CardEditor) -> dict:
    match action:
        case ApiCall.card_editor:
            return {"template":get_card_edit_template(res_call.card_id)}
        case ApiCards.card_draft:
            ApiCards.add_card()
    return {}

def get_card_edit_template(card_id:str, **_):
    card:Cards = ApiCards.create_card(card_id=card_id)
    return render_template(f"{Pages.home.path}card_ba.html",
                           editor=True,card=card,
                           special=special_things
                       )

