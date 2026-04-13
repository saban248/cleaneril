import json
import time
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import JSON

from api.databases.general import get_columns_as_dict, unknown, get_columns, get_latest_columns
from api.databases.ptc import cleaneril_db, StateOrder
from api.ptc import generate_hex
from api.routes.ptc import ClientLeadFrom, PaymentInvoice, OrderType, ResponseStruct


class CleanOrder(cleaneril_db.Model):
    __tablename__ = "cleanOrder"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    stat = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    client_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    order_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    items   = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    address = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    fullname = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    phone = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    vat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False)
    price = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    off_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    off = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False)
    lead_from = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    notes = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    timestamp_entered = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    expense = cleaneril_db.Column(cleaneril_db.Float, nullable=False, default=0.0)
    workers = cleaneril_db.Column(JSON, nullable=False)
    profit_sharing = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, default=0)
    coordinates = cleaneril_db.Column(JSON, nullable=False)
    payment_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    payment_notes = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    order_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)



def get_clean_orders(source:bool = True, **kwargs):
    return get_columns(CleanOrder, source, **kwargs)

def get_clean_order_latest(**kwargs):
    return get_latest_columns(CleanOrder, lambda o:o.date, **kwargs)

def create_clean_order(response:ResponseStruct.CleanOrder) -> CleanOrder:
    order = CleanOrder()
    order.stat = response.s
    order.client_id = generate_hex(2)#TODO
    order.order_id = generate_hex(15)
    order.date = response.date
    order.items = response.i
    order.address = response.address
    order.fullname = response.fn#TODO
    order.phone = response.phone#TODO
    order.vat = response.vat
    order.price = response.price
    order.off_price = response.op
    order.off = bool(response.op)
    order.lead_from = response.lf
    order.notes = response.notes
    order.timestamp_entered = time.time()
    order.expense = response.ex
    order.workers = response.workers
    order.profit_sharing = response.ps
    order.coordinates = response.coordinate
    order.payment_type = response.pt
    order.payment_notes = response.pn
    order.order_type = response.ot

    cleaneril_db.session.add(order)
    cleaneril_db.session.commit()
    return order


def add_clean_order(order_id:str = None, stat:StateOrder = StateOrder.WAIT, phone:str = unknown,
                    items:dict = None, off:bool = False, off_p:int = 0, fullname:str = unknown, date:float = 0.0,
                    address:str = unknown, lead_from:int = ClientLeadFrom.WHATSAPP,
                    notes:str = unknown, price:float = 0.0, vat:bool = False, expense:float = 0.0,
                    worker:list = unknown, ps:int = 0, coordinate:list|tuple = (0,0), payment_type:int = PaymentInvoice.CASH):
    if not order_id:
        order = CleanOrder()
        order.client_id = generate_hex(7)
        order.timestamp_entered = datetime.fromtimestamp(time.time(), tz=ZoneInfo("Asia/Jerusalem")).timestamp()
    else:
        order = get_clean_orders(order_id=order_id).first()

    order.stat = stat
    order.items = json.dumps(items or dict())
    order.off = off
    order.date = date
    order.address = address
    order.lead_from = lead_from
    order.notes = notes
    order.off_price = off_p
    order.price = price
    order.vat = vat
    order.fullname = fullname
    order.phone = phone
    order.expense = expense
    order.workers = []
    order.profit_sharing = ps
    order.coordinates = list(coordinate)
    order.payment_type = payment_type
    order.client_id = generate_hex(2)
    order.order_type = OrderType.GENERAL
    order.payment_notes = unknown
    if not order_id:
        cleaneril_db.session.add(order)

    cleaneril_db.session.commit()

    return order


def delete_clean_order(order_id:str):
    order = get_clean_orders(order_id=order_id).first()
    if not order:return 1

    cleaneril_db.session.delete(order)
    cleaneril_db.session.commit()
    return 0


def set_clean_order_stat(order_id:str, stat:StateOrder):
    order:CleanOrder = get_clean_orders(order_id=order_id).first()
    if not order:return 1
    order.stat = stat
    cleaneril_db.session.commit()
    return 0


class CountOfOrderByStat:
    DEFAULT_DF = 0
    DEFAULT_DT = time.time()
    def __init__(self, date_from:float = DEFAULT_DF, date_to:float = DEFAULT_DT):
        self.__orders = get_clean_order_latest()
        self.__df = date_from
        self.__dt = date_to

    def __sort(self, stat:int):
        return sorted(self.__orders, key=lambda order:order.stat&stat and self.__df<order.date<=self.__dt).__len__()

    @property
    def wait(self):return self.__sort(StateOrder.WAIT)
    @property
    def done(self):return self.__sort(StateOrder.DONE)
    @property
    def canceled(self):return self.__sort(StateOrder.CANCELED)
    @property
    def closed(self):return self.__sort(StateOrder.CLOSED)

