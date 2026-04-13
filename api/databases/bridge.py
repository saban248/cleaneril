import json


from api.databases.clients import ApiClients, Clients
from api.databases.employee import ApiEmployee
from api.databases.funds import ApiFunds

def set_employee_to_client(wid:str, mid:str):
    employee = ApiEmployee.get_employees(employee_id=wid).first()
    if not employee:
        return mid

    return wid


def get_client_date_arrive(cid):
    client:Clients = ApiClients.get_clients(client_id=cid).first()
    if not client:
        return 0

    return client.date


def get_client_items_ordered(cid):
    client:Clients = ApiClients.get_clients(client_id=cid).first()
    if not client:
        return str()

    return client.items


def get_client_total_price(cid):
    client: Clients = ApiClients.get_clients(client_id=cid).first()
    if not client:
        return 0

    return client.price


def get_client_off_price(cid):
    client: Clients = ApiClients.get_clients(client_id=cid).first()
    if not client:
        return 0

    return client.off_price