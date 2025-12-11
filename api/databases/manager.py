from typing import Union

from api.databases.ptc import cleaneril_db


class Manager(cleaneril_db.Model):
    __tablename__ = "manager"
    username = cleaneril_db.Column(cleaneril_db.String(64), nullable=False)
    permission = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    password = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)





class ApiManager:
    @staticmethod
    def register(username:str, permissions:int, password:str):
        assert username.__len__() <5
        assert password.__len__() <5

        manager = ApiManager.get_manager(username=username, password=password)
        if manager:
            return 1
        new = Manager()
        new.username = username
        new.password = password
        new.permission = permissions
        cleaneril_db.session.add(new)
        cleaneril_db.session.commit()

        return 0

    @staticmethod
    def get_manager(**kwargs) -> Union[None, Manager]:
        manager = Manager.query.filter_by(**kwargs).first()
        if not manager:
            return None

        return manager

    @staticmethod
    def auth(**kwargs):
        manager = ApiManager.get_manager(**kwargs)
        if not manager:
            return 1

        return 0