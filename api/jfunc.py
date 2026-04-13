import json
import time
from datetime import datetime
from zoneinfo import ZoneInfo

from api.databases.employee import Employee
from api.databases.ptc import StateOrder, cleaneril, ManagerPermissions
from api.routes.ptc import PaymentInvoice


# jinja functions
@cleaneril.template_filter("to_dict")
def fromjson(value):
    return json.loads(value)

@cleaneril.template_filter("cda")
def client_date_arrive(ts):
    return datetime.fromtimestamp(ts).strftime("%d.%m.%Y")

@cleaneril.template_filter("cdar")
def client_date_arrive(ts):
    if not ts:
        ts = time.time()
    ts = float(ts)
    if ts > 1e12:
        ts /= 1000

    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")

@cleaneril.template_filter("cdah")
def client_date_arrive_hour(ts):
    ts = float(ts)
    if ts > 1e12:
        ts /= 1000

    return datetime.fromtimestamp(ts, ZoneInfo("Asia/Jerusalem")).strftime("%H:%M")

@cleaneril.template_filter("jrt")
def json_roundtrip(obj):
    return json.loads(obj).items()


@cleaneril.template_filter("ctime")
def get_ctime_from_time(ctime:float):
    return time.ctime(ctime)

@cleaneril.template_filter("cft")
def client_flag_text(flag):
    match flag:
        case StateOrder.WAIT:
            return "לא נסגר"
        case StateOrder.CANCELED:
            return "בוטל"
        case StateOrder.CLOSED:
            return "בהמתנה"
        case StateOrder.DONE:
            return "הושלם"

@cleaneril.template_filter("eper")
def employee_permission(employee:Employee, flag:int):
    return flag & employee.permission

@cleaneril.template_filter("pft")
def permission_flag_text(flag):
    match flag:
        case ManagerPermissions.VIEW:
            return "צפייה"
        case ManagerPermissions.EDIT:
            return "עריכה"
        case ManagerPermissions.ADMIN:
            return "ניהול"

    return "unknown"

@cleaneril.template_filter("pft")
def payment_type_text(flag):
    match flag:
        case PaymentInvoice.CASH:
            return "מזומן"
        case PaymentInvoice.BANK_TRANSFER:
            return "העברה"
        case PaymentInvoice.CHECK:
            return "צ'יק"
        case PaymentInvoice.OTHER:
            return "אחר \ לא צוין"

    return payment_type_text(PaymentInvoice.OTHER)

@cleaneril.template_filter("vatop")
def vat_of_price(price):
    return float(f'{price*0.18:.2f}')

@cleaneril.template_filter("zfill4")
def zfill_number(number):
    return str(number).zfill(4)