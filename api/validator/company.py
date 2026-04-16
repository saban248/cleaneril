import re

from api.validator import core_msg


def username(u: str) -> int:
    __error__ = core_msg.ServerCode.Register.invalid_username
    __success__ = core_msg.ServerCode.success
    if not u or " " in u:
        return __error__
    u = u.strip()

    if not u.isalnum():
        return __error__

    if len(u) < 3:
        return __error__

    return __success__

def name(n):
    n = re.sub(r'\s+', ' ', n)
    if all(ord(c) < 128 for c in n):
        n = " ".join(word.capitalize() for word in n.split(" "))

    names = re.split(r"\s+", n)
    if len(names) > 2:
        return core_msg.ServerCode.Company.short_company_name
    return core_msg.ServerCode.success


def phone(p):
    pr = r"^(05\d{8}|0[2-9]\d{7})$"
    if not re.match(pr, p):
        return core_msg.ServerCode.General.invalid_phone

    return core_msg.ServerCode.success


def description(desc):
    dw = re.split(r"\s+", desc)
    if len(dw) < 3 or len(dw) > 4:
        return core_msg.ServerCode.Company.i_company_description

    return core_msg.ServerCode.success


def password(pwd:str):
    __error__ = core_msg.ServerCode.General.invalid_passwd
    if not pwd or len(pwd) < 6 or not re.match(r'^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:,.<>?]+$', pwd):
        return __error__

    if not re.search(r'[\d!@#$%^&*()_\-+=\[\]{};:,.<>?]', pwd):
        return __error__

    return core_msg.ServerCode.success

def ownername(n):
    __error__ = core_msg.ServerCode.Company.i_owner_name
    if not n:
        return __error__

    if not re.fullmatch(r'[^\W\d_]+( [^\W\d_]+)+', n, re.UNICODE):
        return __error__

    return core_msg.ServerCode.success