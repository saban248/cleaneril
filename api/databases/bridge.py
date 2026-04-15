import json

from api.databases import orders, clients
from api.databases.clients import ClientProfile
from api.databases.employee import ApiEmployee, unknown
from api.databases.funds import ApiFunds
from api.databases.orders import CleanOrder
from api.databases.ptc import cleaneril_db
from api.jfunc import clean_phone_just_numbers, match_nums_words
from api.routes import cil_struct


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


def on_create_order_create_client(order:CleanOrder):
    if not order:return
    client:ClientProfile = None
    for c in clients.get_clients().all():
        phone = clean_phone_just_numbers(c.phone) == clean_phone_just_numbers(order.phone)
        name = match_nums_words(1, c.fullname, order.fullname)
        if name and phone:
            client = c
            break
    if not client:
        new_client = clients.create_client_profile(order.manager_id, order.fullname,order.address,order.phone,unknown, order.coordinates)
        order.client_id = new_client.client_id
    else:
        order.client_id = client.client_id
    cleaneril_db.session.commit()


