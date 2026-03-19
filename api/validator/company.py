import re

from api.ptc import SJson
from api.validator import core_msg


def username(u: str):
    __error__ = core_msg.Company.username
    if not u or " " in u:
        return __error__
    u = u.strip()

    if not u.isalnum():
        return __error__

    if len(u) < 3:
        return __error__

    return str()

def name(n):
    n = re.sub(r'\s+', ' ', n)
    if all(ord(c) < 128 for c in n):
        n = " ".join(word.capitalize() for word in n.split(" "))

    names = re.split(r"\s+", n)
    if len(names) > 2:
        return core_msg.Company.long_name
    return str()


def phone(p):
    pr = r"^(05\d{8}|0[2-9]\d{7})$"
    if not re.match(pr, p):
        return core_msg.Company.phone

    return str()


def description(desc):
    dw = re.split(r"\s+", desc)
    if len(dw) < 3 or len(dw) > 4:
        return core_msg.Company.description

    return str()


def password(pwd:str):
    __error__ = core_msg.Company.password
    if not pwd or len(pwd) < 6 or not re.match(r'^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:,.<>?]+$', pwd):
        return __error__

    if not re.search(r'[\d!@#$%^&*()_\-+=\[\]{};:,.<>?]', pwd):
        return __error__

    return str()

def ownername(n):
    if not n:
        return core_msg.Company.fullname

    # Regex:
    # מילה (אותיות בלבד) + (רווח אחד + מילה) לפחות פעם אחת
    if not re.fullmatch(r'[^\W\d_]+( [^\W\d_]+)+', n, re.UNICODE):
        return core_msg.Company.fullname

    return str()