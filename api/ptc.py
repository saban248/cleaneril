import binascii
import os
from copy import deepcopy
from typing import Union

from flask import Request
from flask.sessions import SessionMixin

CONTENT_TYPE_DATA = "multipart/form-data"
CONTENT_TYPE_FORM = "application/x-www-form-urlencoded"
CONTENT_TYPE_JSON = "application/json"
CONTENT_TYPE_ARGS = "a"

special_things = [
    "חיטוי מחיידקים",
     "זירוז הייבוש",
     "בישום אחרי ניקוי",
     "הסרת כתמי מים אוכל ולכלוך",
     "טיפול 360 לריפוד שלכם"]




class ShortSession:

    @staticmethod
    def set_admin(session:SessionMixin):
        session["is_admin"] = True

    @staticmethod
    def is_admin(session:SessionMixin):
        return session.get("is_admin")

    @staticmethod
    def set_nonce(session:SessionMixin) -> str:
        nonce = binascii.b2a_hex(os.urandom(16)).decode()
        session["nonce"] = nonce

        return nonce
    @staticmethod
    def get_admin_details(session:SessionMixin) -> dict:
        return session.get("details", {})

    @staticmethod
    def set_admin_details(session:SessionMixin, data:dict):
        session['details'] = data
    @staticmethod
    def valid_nonce(session:SessionMixin, breq:dict):
        return session.get("nonce", str(None)) == breq.get("nonce")




class SJson:
    msg_json = {"success":None, "title":None, "notice":None, "code":0}

    @staticmethod
    def error(error_content:Union[str, int] = 'error', **errors):
        msg = dict(SJson.msg_json, **errors)
        msg["success"] = False
        msg["title"] = "התרחשה שגיאה"
        SJson.__set_notice(msg, error_content)
        return msg

    @staticmethod
    def success(success_content:Union[str, int] = 'success', **success):
        msg = dict(SJson.msg_json, **success)
        msg["success"] = True
        msg["title"] = "הושלם"
        SJson.__set_notice(msg, success_content)
        return msg | success

    @staticmethod
    def __set_notice(msg:dict, notice:Union[str, int]):
        if isinstance(notice, str):
            msg["notice"] = notice
            msg["code"] = -1
        elif isinstance(notice, int):
            msg["notice"] = 'unknown'
            msg["code"] = notice



def get_dictionary_http(req:Request, content_type:str = str()) -> dict:
    _ctype = req.content_type or str()
    if CONTENT_TYPE_FORM in _ctype or CONTENT_TYPE_DATA in _ctype:
        return deepcopy(req.form.to_dict())

    elif CONTENT_TYPE_JSON in _ctype:
        return deepcopy(req.json)

    elif req.method == 'GET':
        return deepcopy(req.args.to_dict())

    # else return empty dictionary
    return dict()


def generate_hex(length:int=5):
    g = binascii.b2a_hex(os.urandom(length)).decode()
    index = (length - ord(g[length])) % length
    return g[index].upper()+g

