from typing import Union

from api.databases.company import ApiCompany
from api.databases.ptc import cleaneril_db, ManagerPermissions
from api.ptc import generate_hex


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
        assert not username.__len__() <5
        assert not password.__len__() <5

        manager = ApiManager.get_managers(username=username, password=password).first()
        if manager:
            return manager

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
            return 1

        return 0


def new_manager_hb():
    manager = dict(username = "avraham",
         password = "Ghs553321",
         permission = ManagerPermissions.VIEW | ManagerPermissions.EDIT,
         )

    new_manager = ApiManager.register(**manager)

    ApiCompany.create_company("הברקה בדקה",new_manager.username, new_manager.manager_id, False)