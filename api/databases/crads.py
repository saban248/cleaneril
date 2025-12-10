from api.databases.ptc import cleaneril_db


class Cards(cleaneril_db.Model):
    __tablename__ = "cards"
    card_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    state   = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    title   = cleaneril_db.Column(cleaneril_db.String(100), nullable=False)
    off     = cleaneril_db.Column(cleaneril_db.Boolean, default=False)
    off_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    img_path = cleaneril_db.Column(cleaneril_db.String(248), nullable=False)
    description = cleaneril_db.Column(cleaneril_db.String(5000), nullable=False)
