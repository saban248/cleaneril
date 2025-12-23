import json
import os
import time
from typing import Union
from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument, ServerConfig, StateClient
from api.routes.ptc import ClientLeadFrom

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



class ApiClients:

    @staticmethod
    def get_clients(source:bool = True, **kwargs):
        clients = Clients.query.filter_by(**kwargs)
        if source:
            return clients
        for card in clients:del card.__dict__["_sa_instance_state"]

        return clients

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
                   notes:str = unknown, price:float = 0.0, vat:bool = False):
        if not client_id:
            client = Clients()
            client.client_id = generate_hex(7)
            client.timestamp_entered = time.time()
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