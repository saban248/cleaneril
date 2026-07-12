from api.databases.general import get_columns, get_columns_as_dict
from api.databases.ptc import cleaneril_db
from api.marketplace.ptc import JobMarketplaceState


class Job(cleaneril_db.Model):
    __tablename__ = "jobs"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    job_id = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    state = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    order_id = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    from_company = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    from_manager = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    to_company = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    to_manager = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    availability_window = cleaneril_db.Column(cleaneril_db.Float, nullable=False, primary_key=True)
    watches = cleaneril_db.Column(cleaneril_db.JSON, nullable=False, primary_key=True)
    requests = cleaneril_db.Column(cleaneril_db.JSON, nullable=False, primary_key=True)
    time_created = cleaneril_db.Column(cleaneril_db.Float, nullable=False, primary_key=True)
    last_update = cleaneril_db.Column(cleaneril_db.Float, nullable=False, primary_key=True)
    # תיאור העבודה - או תיאור שבא מההזמנה המקורית
    description = cleaneril_db.Column(cleaneril_db.String, nullable=False, primary_key=True)
    # הערות חובה כדי לבצע את העבודה
    requirements = cleaneril_db.Column(cleaneril_db.JSON, nullable=False, primary_key=True)
    money_to_worker = cleaneril_db.Column(cleaneril_db.Float, nullable=False, primary_key=True)
    tax = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False, primary_key=True)



def get_jobs(source:bool = True, **kwargs):
    return get_columns(Job, source, **kwargs)


def get_jobs_available(source:bool = True, **kwargs):
    jobs = Job.query.filter(
        Job.state.bitwise_and(JobMarketplaceState.AVAILABLE) != 0
    )
    if not source:
        return get_columns_as_dict(jobs)

    return jobs

