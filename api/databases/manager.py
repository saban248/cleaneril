from typing import Union

from api.databases import company
from api.databases.company import delete_company
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

        temp = []
        for manager in managers:
            copy =  manager.__dict__
            del copy['_sa_instance_state']
            temp.append(copy)
        return temp

    @staticmethod
    def auth(**kwargs):
        manager = ApiManager.get_managers(**kwargs)
        if not manager.first():
            return core_msg.ServerCode.General.access_denied

        return core_msg.ServerCode.success


def delete_manager(username:str, password:str, **kwargs):
    manager = ApiManager.get_managers(username=username, password=password, **kwargs).first()
    cleaneril_db.session.delete(manager)
    cleaneril_db.session.commit()
    return core_msg.ServerCode.success


def on_register_create_company(user:str, pwd:str) -> int:
    null = 'unknown'
    new = ApiManager.register(user, -1, pwd)
    if not new:return core_msg.ServerCode.Register.e_account_exist
    company.create_company(null,null,new.manager_id,False)
    return core_msg.ServerCode.success


def on_delete_manager_delete_company(user:str, pwd:str) -> int:
    delete_manager(user,pwd)
    # delete_company();


def new_manager_hb():
    u = 'avraham'
    p = 'Ghs553321'
    manager = dict(username = "avraham",
         password = "Ghs553321",
         permission = ManagerPermissions.ROOT,
         )

    new_manager = ApiManager.register(**manager)
    if not new_manager:return
    company.create_company("הברקה בדקה",new_manager.username, new_manager.manager_id, False)


