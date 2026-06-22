from api.databases.ptc import cleaneril_db



class ManagerSubscription(cleaneril_db.Model):
    __tablename__ = "manager_subscription"

    key = cleaneril_db.Column(cleaneril_db.Integer, primary_key=True)
    manager_id = cleaneril_db.Column(cleaneril_db.String, nullable=False, index=True)
    company_id = cleaneril_db.Column(cleaneril_db.String, nullable=False, index=True)
    subscription_id = cleaneril_db.Column(cleaneril_db.String, nullable=False, index=True)
    plan_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, default=1)
    status = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, default=1)
    time_created = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    time_start = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    time_end = cleaneril_db.Column(cleaneril_db.Float, nullable=True)
    auto_renew = cleaneril_db.Column(cleaneril_db.Boolean, default=False)
    last_payment_time = cleaneril_db.Column(cleaneril_db.Float)
    note = cleaneril_db.Column(cleaneril_db.String(500))


