import time
from datetime import datetime

from api.databases.bridge import get_client_date_arrive, get_client_items_ordered, get_client_total_price, \
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
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    payment_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    is_vat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False, default=False)
    items = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    total_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    off_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    stat = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)



class ApiInvoice:
    @staticmethod
    def get_invoices(source:bool = True, **kwargs):
        invoice = Invoice.query.filter_by(**kwargs)
        if source:
            return invoice

        return [{c.name: getattr(e, c.name) for c in e.__table__.columns} for e in invoice]

    @staticmethod
    def create_invoice(mid, cid, payment_type:PaymentInvoice, stat:int = InvoiceStatType.PAID):
        invoice = Invoice()
        invoice.invoice_id = generate_hex(15)
        invoice.manager_id = mid
        invoice.client_id = cid
        invoice.date = time.time()
        invoice.items = get_client_items_ordered(cid)
        invoice.total_price = get_client_total_price(cid)
        invoice.off_price = get_client_off_price(cid)
        invoice.payment_type = payment_type
        invoice.stat = stat
        cleaneril_db.session.add(invoice)
        cleaneril_db.session.commit()
        return 0

    @staticmethod
    def get_invoices_list():
        invoices:list[Invoice] = sorted(ApiInvoice.get_invoices().all(), key=lambda invoice: invoice.date, reverse=True)
        temp = []
        for i in invoices:
            date = datetime.fromtimestamp(i.date)
            del i.__dict__['_sa_instance_state']
            temp.append(i.__dict__)

        return temp