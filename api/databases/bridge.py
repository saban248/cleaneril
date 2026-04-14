import json

from api.databases import orders
from api.databases.employee import ApiEmployee
from api.databases.funds import ApiFunds
from api.databases.orders import CleanOrder


def set_employee_to_client(wid:str, mid:str):
    employee = ApiEmployee.get_employees(employee_id=wid).first()
    if not employee:
        return mid

    return wid


def get_order_date_arrive(cid):
    order = orders.get_clean_orders(client_id=cid).first()
    if not order:
        return 0

    return order.date


def get_order_items(cid):
    order:CleanOrder = orders.get_clean_orders(client_id=cid).first()
    if not order:
        return str()

    return order.items


def get_client_total_price(cid):
    order: CleanOrder = orders.get_clean_orders(client_id=cid).first()
    if not order:
        return 0

    return order.price


def get_client_off_price(cid):
    order: CleanOrder = orders.get_clean_orders(client_id=cid).first()
    if not order:
        return 0

    return order.off_price