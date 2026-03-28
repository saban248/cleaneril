from api.databases.ptc import cleaneril_db


class Invoice(cleaneril_db.Model):
    __tablename__ = "invoice"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    invoice_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    client_id   = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    date = cleaneril_db.Column(cleaneril_db.Float, nullable=False)



class ApiInvoice:
    @staticmethod
    def create_invoice(mid, cid):...
