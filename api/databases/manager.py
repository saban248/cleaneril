from typing import Union

from api.databases import company
from api.databases.ptc import cleaneril_db, ManagerPermissions
from api.ptc import generate_hex
from api.validator import core_msg, company as comp

class Manager(cleaneril_db.Model):
    __tablename__ = "manager"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    username = cleaneril_db.Column(cleaneril_db.String(64), nullable=False)
    permission = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    password = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)



class ApiManager:
    @staticmethod
    def register(username:str, permission:int, password:str):

        manager = ApiManager.get_managers(username=username, password=password).first()
        if manager:
            return None

        new = Manager()
        new.username = username
        new.password = password
        new.permission = permission
        new.manager_id = generate_hex(15)
        cleaneril_db.session.add(new)
        cleaneril_db.session.commit()

        return new

    @staticmethod
    def get_managers(source:bool = True, **kwargs) -> Union[None, Manager]:
        managers = Manager.query.filter_by(**kwargs)
        if source:
            return managers

        for manager in managers:del manager.__dict__['_sa_instance_state']
        return managers

    @staticmethod
    def auth(**kwargs):
        manager = ApiManager.get_managers(**kwargs)
        if not manager.first():
            return core_msg.ServerCode.General.access_denied

        return core_msg.ServerCode.success


def on_register_create_company(user:str, pwd:str) -> int:
    null = 'unknown'
    new = ApiManager.register(user, ManagerPermissions.ADMIN, pwd)
    if not new:return core_msg.ServerCode.Register.e_account_exist
    company.create_company(null,null,new.manager_id,False)
    return core_msg.ServerCode.success

def new_manager_hb():
    manager = dict(username = "avraham",
         password = "Ghs553321",
         permission = ManagerPermissions.VIEW | ManagerPermissions.EDIT,
         )

    new_manager = ApiManager.register(**manager)
    if not new_manager:return
    company.create_company("הברקה בדקה",new_manager.username, new_manager.manager_id, False)