import json
import time
from datetime import datetime

from api.databases.bridge import get_order_items, get_client_total_price, \
    get_client_off_price
from api.databases.general import get_columns
from api.databases.ptc import cleaneril_db
from api.ptc import generate_hex
from api.routes.ptc import PaymentInvoice, InvoiceStatType
from api.validator import core_msg


class Receipt(cleaneril_db.Model):
    __tablename__ = "receipts"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    receipt_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    client_id   = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    order_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    payment_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    is_vat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False, default=False)
    stat = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)


def get_receipts(source:bool = True, **kwargs):
    return get_columns(Receipt, source, **kwargs)

def create_receipt(manager_id:str, client_id:str, order_id:str, stat:int,pt:int, force:bool = False):
    # check
    if not client_id or not order_id:
        return core_msg.ServerCode.Receipt.receipt_create_problem
    receipt = get_receipts(manager_id=manager_id, client_id=client_id, order_id=order_id).first()
    if receipt:
        if not force:
            return core_msg.ServerCode.Receipt.receipt_exist
        cleaneril_db.session.delete(receipt)
        cleaneril_db.session.commit()

    receipt = Receipt()
    receipt.manager_id = manager_id
    receipt.client_id = client_id
    receipt.order_id = order_id
    receipt.receipt_id = generate_hex(15)
    receipt.date = time.time()
    receipt.stat = stat
    receipt.is_vat = False
    receipt.payment_type = pt
    cleaneril_db.session.add(receipt)
    cleaneril_db.session.commit()
    return core_msg.ServerCode.success


def delete_receipt(manager_id:str, receipt_id:str):
    receipt = get_receipts(manager_id=manager_id, receipt_id=receipt_id).first()
    if not receipt:
        return core_msg.ServerCode.General.something_wrong
    cleaneril_db.session.delete(receipt)
    cleaneril_db.session.commit()
    return core_msg.ServerCode.success