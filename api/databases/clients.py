import json
import os
import time
from datetime import datetime
from typing import Union
from zoneinfo import ZoneInfo

from sqlalchemy import JSON

from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument, ServerConfig, StateClient
from api.routes.ptc import ClientLeadFrom, CalenderClients, get_calender_client, is_bwt_date

unknown = 'unknown'

class Clients(cleaneril_db.Model):
    __tablename__ = "clients"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    state = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    client_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    fullname = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    items   = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    address = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    vat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False)
    price = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    off_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    off = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False)
    phone = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    lead_from = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    notes = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    timestamp_entered = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    expense = cleaneril_db.Column(cleaneril_db.Float, nullable=False, default=0.0)
    worker = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    profit_sharing = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, default=0)
    coordinates = cleaneril_db.Column(JSON, nullable=False)



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
    def add_client(client_id:str = None, state:StateClient = StateClient.WAIT, phone:str = unknown,
                   items:dict = None, off:bool = False, off_p:int = 0, fullname:str = unknown, date:float = 0.0,
                   address:str = unknown, lead_from:int = ClientLeadFrom.WHATSAPP,
                   notes:str = unknown, price:float = 0.0, vat:bool = False, expense:float = 0.0,
                   worker:str = unknown, ps:int = 0, coordinate:list|tuple = (0,0)):
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
    def set_state(client_id:str, state:StateClient):
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
        return ApiClients.get_clients_lately(calender=calender, state=StateClient.WAIT).__len__()
    @staticmethod
    def count_client_done(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateClient.DONE).__len__()
    @staticmethod
    def count_client_closed(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender,state=StateClient.CLOSED).__len__()
    @staticmethod
    def count_client_canceled(calender = CalenderClients.FOREVER):
        return ApiClients.get_clients_lately(calender=calender, state=StateClient.CANCELED).__len__()

    @staticmethod
    def get_clients_by_calendar_date(month:int, year:int):
        collector = []
        clients:list[Clients] = ApiClients.get_clients()
        for client in clients:
            date = datetime.fromtimestamp(client.date)
            lat,lng = client.coordinates or [0,0]
            if not client.state&(StateClient.DONE|StateClient.CLOSED|StateClient.CANCELED) or date.month+date.year!=month+year:
                continue
            collector.append({"id":client.client_id,"name":client.fullname,"date":date.strftime("%Y-%m-%d"),
                              "stat":client.state, "lat":lat, "lng":lng, "address":client.address})

        return collector

