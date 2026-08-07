from api.databases.ptc import cleaneril_db



class Integration(cleaneril_db.Model):
    __tablename__ = 'integration'
    id = cleaneril_db.Column(cleaneril_db.Integer, primary_key=True)
    company_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    provider = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, default=1)
    account_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    account_name = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    access_token = cleaneril_db.Column(cleaneril_db.String(2048), nullable=False)
    refresh_token = cleaneril_db.Column(cleaneril_db.String(2048), nullable=True)
    expires_at = cleaneril_db.Column(cleaneril_db.Float, nullable=True)
    stat = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    created_at = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    update_at = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    metadata = cleaneril_db.Column(cleaneril_db.String, nullable=False)
    scope = cleaneril_db.Column(cleaneril_db.String(512), nullable=True)
    last_sync_at = cleaneril_db.Column(cleaneril_db.Float, nullable=True)
    last_error = cleaneril_db.Column(cleaneril_db.JSON, nullable=True)

