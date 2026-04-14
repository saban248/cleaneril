import json
import time
from datetime import datetime

from api.databases.bridge import get_order_items, get_client_total_price, \
    get_client_off_price
from api.databases.ptc import cleaneril_db
from api.ptc import generate_hex
from api.routes.ptc import PaymentInvoice, InvoiceStatType


class Invoice(cleaneril_db.Model):
    __tablename__ = "invoice"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    invoice_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    client_id   = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    order_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    payment_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    is_vat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False, default=False)
    stat = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    order = cleaneril_db.Column(cleaneril_db.String, nullable=False)


class ApiInvoice:
    @staticmethod
    def get_invoices(source:bool = True, **kwargs):
        invoice = Invoice.query.filter_by(**kwargs)
        if source:
            return invoice

        return [{c.name: getattr(e, c.name) for c in e.__table__.columns} for e in invoice]

    # @staticmethod
    # def create_invoice(mid, client:Clients, payment_type:PaymentInvoice, stat:int = InvoiceStatType.PAID):
    #     if not client:return 1
    #     invoice = Invoice()
    #     invoice.invoice_id = generate_hex(15)
    #     invoice.manager_id = mid
    #     invoice.client_id = client.client_id
    #     invoice.date = time.time()
    #     invoice.payment_type = payment_type
    #     invoice.stat = stat
    #
    #     order_data = client.__dict__
    #     del order_data['_sa_instance_state']
    #     invoice.order = json.dumps(order_data)
    #     cleaneril_db.session.add(invoice)
    #     cleaneril_db.session.commit()
    #     return 0

    @staticmethod
    def get_invoices_list():
        invoices:list[Invoice] = sorted(ApiInvoice.get_invoices().all(), key=lambda invoice: invoice.date, reverse=True)
        temp = []
        for i in invoices:
            date = datetime.fromtimestamp(i.date)
            del i.__dict__['_sa_instance_state']
            temp.append(i.__dict__)

        return temp