import time

from api.databases import orders
from api.databases.general import get_columns
from api.databases.orders import CleanOrder
from api.databases.ptc import cleaneril_db
from api.ptc import generate_hex
from api.routes import cil_struct
from api.validator import core_msg


def create_history_id():
    # protocol
    return "CH"+generate_hex(14)


def create_description_order_changed(mid:str, order:cil_struct.CleanOrder):
    d = []
    old_order:CleanOrder = orders.get_clean_orders(manager_id=mid, order_id=order.oi).first()
    print(type(old_order.items), type(order.i))
    if not old_order:return d

    if int(order.price) != old_order.price:
        d.append("מחיר")
    if order.address != old_order.address:
        d.append("כתובת")
    if order.i != old_order.items:
        print(order.i)
        print(old_order.items)
        d.append("פריטי הזמנה")
    if order.date != old_order.date:
        d.append("תאריך")

    return ", ".join(d)





class ClientHistory(cleaneril_db.Model):
    __tablename__ = "client_history"
    key = cleaneril_db.Column(cleaneril_db.Integer, primary_key=True)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    client_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    history_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    order_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    entity = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    action = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    description = cleaneril_db.Column(cleaneril_db.Text, nullable=False)
    created_at = cleaneril_db.Column(cleaneril_db.Float, nullable=False)


def create_history(mid:str, cid:str, oid:str, entity:int = 0, action:int = 0, description:str = ""):
    history = ClientHistory()
    history.history_id = create_history_id()
    history.manager_id = mid
    history.client_id = cid
    history.order_id = oid
    history.entity = entity
    history.action = action
    history.description = description
    history.created_at = time.time()
    cleaneril_db.session.add(history)
    cleaneril_db.session.commit()

    return history


def get_histories(source:bool = True, **kwargs):
    history = get_columns(ClientHistory, source, **kwargs)
    return history


def delete_client_history(mid:str, client_id:str):
    histories = get_histories(manager_id=mid, client_id=client_id).all()
    if not histories:return core_msg.ServerCode.General.something_wrong

    for history in histories:
        cleaneril_db.session.delete(history)
        cleaneril_db.session.commit()

    return core_msg.ServerCode.success


def delete_history(mid:str, history_id:str):
    history:ClientHistory = get_histories(manager_id=mid, history_id=history_id).first()
    if not history:return core_msg.ServerCode.General.something_wrong
    cleaneril_db.session.delete(history)
    cleaneril_db.session.commit()
    return core_msg.ServerCode.success
