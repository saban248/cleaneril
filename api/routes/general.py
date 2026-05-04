from flask import session

from api.ptc import ShortSession


def set_session_data_admin(ses, manager):
    ShortSession.set_admin(session)
    as_dict = manager.__dict__
    del as_dict["_sa_instance_state"]
    ShortSession.set_admin_details(session, as_dict)