import json
import os
import time
from datetime import datetime
from typing import Union
from zoneinfo import ZoneInfo

from sqlalchemy import JSON

from api.databases.general import get_columns, get_latest_columns
from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument, ServerConfig, StateOrder
from api.routes.ptc import ClientLeadFrom, CalenderClients, get_calender_client, is_bwt_date, PaymentInvoice, \
    ResponseStruct

unknown = 'unknown'

class ClientProfile(cleaneril_db.Model):
    __tablename__ = "client_profile"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    client_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    fullname = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    address = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    phone = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    notes = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    timestamp_entered = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    coordinates = cleaneril_db.Column(JSON, nullable=False)


def get_clients(source:bool = True, **kwargs):
    return get_columns(ClientProfile, source, **kwargs)


def get_clients_latest(**kwargs):
    return get_latest_columns(ClientProfile, lambda c:c.timestamp_entered, **kwargs)


def create_client_profile(fullname:str, address:str, phone:str, notes:str, coordinates:list):
    client = ClientProfile()
    client.client_id = generate_hex(15)
    client.fullname = fullname
    client.address = address
    client.phone = phone
    client.notes = notes
    client.timestamp_entered = time.time()
    client.coordinates = coordinates
    cleaneril_db.session.add(client)
    cleaneril_db.session.commit()
    return client


def edit_exist_client(response:ResponseStruct.Client):...


class ApiClients:

    @staticmethod
    def get_clients(source:bool = True, **kwargs):
        clients = Clients.query.filter_by(**kwargs)
        if source:
            return clients

        return [{c.name: getattr(e, c.name) for c in e.__table__.columns} for e in clients]

    @staticmethod
    def create_client(client_id:str):
        client = None
        if client_id:
            client = ApiClients.get_clients(client_id=client_id).first()
        if client:return client
        return ApiClients.add_client()

    @staticmethod
    def add_client(client_id:str = None, state:StateOrder = StateOrder.WAIT, phone:str = unknown,
                   items:dict = None, off:bool = False, off_p:int = 0, fullname:str = unknown, date:float = 0.0,
                   address:str = unknown, lead_from:int = ClientLeadFrom.WHATSAPP,
                   notes:str = unknown, price:float = 0.0, vat:bool = False, expense:float = 0.0,
                   worker:str = unknown, ps:int = 0, coordinate:list|tuple = (0,0), payment_type:int = PaymentInvoice.CASH):
        if not client_id:
            client = Clients()
            client.client_id = generate_hex(7)
            client.timestamp_entered = datetime.fromtimestamp(time.time(), tz=ZoneInfo("Asia/Jerusalem")).timestamp()
        else:
            client = ApiClients.get_clients(client_id=client_id).first()

        client.state = state
        client.phone = phone
        client.items = json.dumps(items or dict())
        client.off = off
        client.fullname = fullname
        client.date = date
        client.address = address
        client.lead_from = lead_from
        client.notes = notes
        client.off_price = off_p
        client.price = price
        client.vat = vat
        client.expense = expense
        client.worker = worker
        client.profit_sharing = ps
        client.coordinates = list(coordinate)
        client.payment_type = payment_type
        if not client_id:
            cleaneril_db.session.add(client)

        cleaneril_db.session.commit()

        return client

    @staticmethod
    def delete_client(client_id:str):
        client = ApiClients.get_clients(client_id=client_id).first()
        if not client:return 1

        cleaneril_db.session.delete(client)
        cleaneril_db.session.commit()
        return 0

    @staticmethod
    def set_state(client_id:str, state:StateOrder):
        client = ApiClients.get_clients(client_id=client_id).first()
        if not client:return 1
        client.state = state
        cleaneril_db.session.commit()
        return 0

    @staticmethod
    def get_clients_lately(state:int, calender = CalenderClients.FOREVER):

        clients = [client for client in ApiClients.get_clients() if
                   (client.state&state and is_bwt_date(client.date, calender))]
        return sorted(clients, key=lambda client: client.date, reverse=True)

    @staticmethod
    def count_client_wait(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateOrder.WAIT).__len__()
    @staticmethod
    def count_client_done(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateOrder.DONE).__len__()
    @staticmethod
    def count_client_closed(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateOrder.CLOSED).__len__()
    @staticmethod
    def count_client_canceled(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateOrder.CANCELED).__len__()

    @staticmethod
    def get_clients_by_calendar_date(month:int, year:int):
        collector = []
        clients:list[Clients] = ApiClients.get_clients()
        for client in clients:
            date = datetime.fromtimestamp(client.date)
            lat,lng = client.coordinates or [0,0]
            if not client.state&(StateOrder.DONE | StateOrder.CLOSED | StateOrder.CANCELED) or date.month+date.year!=month+year:
                continue
            collector.append({"id":client.client_id,"name":client.fullname,"date":date.strftime("%Y-%m-%d"),
                              "stat":client.state, "lat":lat, "lng":lng, "address":client.address})

        return collector

    @staticmethod
    def get_clients_list(from_y:int, to_y:int):
        clients:list[Clients] = sorted(ApiClients.get_clients().all(), key=lambda client: client.date, reverse=True)
        temp = []
        for c in clients:
            date = datetime.fromtimestamp(c.date)
            del c.__dict__['_sa_instance_state']
            temp.append(c.__dict__)

        return temp