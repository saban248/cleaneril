import json
import os
import sqlite3

from api.databases import orders, clients
from api.databases.clients import ClientProfile
from api.databases.employee import ApiEmployee, unknown
from api.databases.orders import CleanOrder
from api.databases.ptc import cleaneril_db, ServerConfig
from api.jfunc import clean_phone_just_numbers, match_nums_words
from api.routes import cil_struct
from api.routes.ptc import CleanOrderType, PaymentInvoice


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


def upgrade_from_clients_to_clean_order(manager_id):
    db = sqlite3.connect(ServerConfig.DB_PATH)
    db.row_factory = sqlite3.Row
    cur = db.cursor()
    try:
        cur.execute("SELECT * FROM clients")
    except sqlite3.OperationalError as error:
        print(error)
        return

    rows = cur.fetchall()
    for c in rows:
        old_order_id = c['client_id']
        phone = c['phone']
        fullname = c['fullname']
        address = c['address']
        coordinates = c['coordinates']
        if orders.get_clean_orders(order_id=old_order_id).first():continue
        client = clients.create_client_profile(manager_id,fullname,address,phone,str(), coordinates)
        order = CleanOrder()
        order.order_id = old_order_id
        order.manager_id = manager_id
        order.client_id = client.client_id
        order.order_type = CleanOrderType.UPHOLSTERY
        order.fullname = fullname
        order.workers = [c['worker']]
        order.stat = c['state']
        order.payment_type = PaymentInvoice.CASH
        order.date = c['date']
        order.timestamp_entered = c['timestamp_entered']
        order.key = c['key']
        order.items = json.loads(c['items'])
        order.phone = phone
        order.coordinates = coordinates
        order.address = address
        order.notes = c['notes']
        order.price = c['price']
        order.off = c['off']
        order.off_price = c['off_price']
        order.payment_notes = str()
        order.vat = c['vat']
        order.lead_from = c['lead_from']
        order.profit_sharing = 0
        order.expense = c['expense']

        cleaneril_db.session.add(order)
        cleaneril_db.session.commit()