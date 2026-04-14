import json
import os
import time
from datetime import datetime
from typing import Union
from zoneinfo import ZoneInfo

from sqlalchemy import JSON

from api.databases.general import get_columns, get_latest_columns, delete_column
from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument, ServerConfig, StateOrder
from api.routes.ptc import ClientLeadFrom, CalenderClients, get_calender_client, is_bwt_date, PaymentInvoice, \
    ResponseStruct


class ClientProfile(cleaneril_db.Model):
    __tablename__ = "client_profile"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    client_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
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

def delete_client(client_id):
    delete_column(ClientProfile, get_clients(client_id=client_id).first())

class _ApiClients:


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