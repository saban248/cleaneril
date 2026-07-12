from api.databases import orders
from api.databases.marketplace.jobs import Job
from api.marketplace.ptc import MarketplaceApiCall, JobMarketplaceState
from api.databases.marketplace import jobs
from api.ptc import SJson




def get_marketplace_api(**breq):
    action:int = breq.get('action', -1)
    match action:
        case MarketplaceApiCall.list_jobs:
            return SJson.auto_code(0, **{"jobs":jobs.get_jobs(False)})

    return SJson.auto_code(0)