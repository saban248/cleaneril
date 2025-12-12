from flask import render_template_string, render_template

from api.routes.ptc import Pages, ApiCall, ResponseStruct


def get_api_action(action:ApiCall, res_call:ResponseStruct.Api) -> dict:
    match action:
        case ApiCall.card_editor:
            return {"template":get_card_edit_template(res_call.card_id)}

    return {}

def get_card_edit_template(card_id:str, **_):

    return render_template(f"{Pages.home.path}card_ba.html",
    card_title="Test",
    card_img="test.png",
    card_id=card_id,
    special=["A", "B"])