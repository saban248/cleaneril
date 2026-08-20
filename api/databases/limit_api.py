import time
from datetime import datetime

from api.databases.general import get_columns
from api.databases.ptc import cleaneril_db, get_max_requests_arl, APIRateLimitStat, get_cooldown_arl
from api.ptc import generate_hex
from api.validator import core_msg


class APIRateLimit(cleaneril_db.Model):
    __tablename__ = "api_limit"

    id = cleaneril_db.Column(cleaneril_db.BigInteger, primary_key=True)
    limit_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    ip = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    limit_type = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    requests = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    cooldown_at = cleaneril_db.Column(cleaneril_db.Float, nullable=False)
    stat = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False)



def get_arls(source:bool = True, **kwargs) -> APIRateLimit:
    return get_columns(APIRateLimit, source, **kwargs)


def exist_by_ip(ip:str) -> bool:
    return get_arls(ip=ip).first()


def create_arl(ip:str, limit_type:int):
    if exist_by_ip(ip):
        update_atl(ip, limit_type)
    limit = APIRateLimit()
    limit.limit_id = "arl"+generate_hex(14)
    limit.ip = ip
    limit.limit_type = limit_type
    limit.requests = 0
    limit.created_at = time.time()
    limit.stat = APIRateLimitStat.ACCESS

    return limit


def update_atl(ip:str, limit_type:int):
    arl:APIRateLimit = get_arls(ip=ip).first()
    if not arl:
        return core_msg.ServerCode.General.something_wrong

    if arl.stat & APIRateLimitStat.DENIED:
        if arl.cooldown_at < (time.time()-arl.cooldown):
            arl.requests = 0
            arl.stat = APIRateLimitStat.ACCESS
        else:
            return core_msg.ServerCode.General.access_denied
    elif arl.max_requests >= get_max_requests_arl(limit_type):
        arl.stat = APIRateLimitStat.DENIED
        arl.cooldown_at = time.time()
        return core_msg.ServerCode.General.access_denied

    arl.requests += 1
    arl.stat = APIRateLimitStat.ACCESS

    return core_msg.ServerCode.success


def reset_arl_limit(ip:str, limit_type:int):
    arl:APIRateLimit = get_arls(ip=ip).first()
    if not arl:
        return core_msg.ServerCode.General.something_wrong

    arl.requests = 0


