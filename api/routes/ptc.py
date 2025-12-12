from dataclasses import dataclass
from enum import Enum, IntFlag


class RoutePagesBase(Enum):

    @property
    def code(self):
        return super().value

    @property
    def path(self):
        return f"/{super().name}"


class RoutePages(RoutePagesBase):

    home = 1<<0
    auth = 1<<1
    dashboard = 1<<2


class RouteApi(RoutePagesBase):
    do_auth = 1<<0
    api     = 1<<1



class Pages(IntFlag):
    home = 1<<0
    auth = 1<<1
    dashboard = 1<<2

    def __str__(self):
        return self.__repr__()
    @property
    def __root__(self):
        return self.name+"/"
    @property
    def html(self):
        return self.__root__+self.name+'.html'
    @property
    def js(self):
        return self.__root__+self.name+".js"
    @property
    def css(self):
        return self.__root__+self.name+".css"
    @property
    def path(self):
        return self.__root__



class ApiCall(IntFlag):
    card_editor = 1<<0


def struct_builder(cls, **data):
    for k, v in data.items():
        if k in cls.__dict__:
            setattr(cls, k, v)


class ResponseStruct:
    @dataclass
    class Auth:
        username:str        = None
        password:str        = None

        def build(self, **data):
            struct_builder(self, **data)
            return self

    @dataclass
    class Api:
        action:int      = None
        card_id:str     = None
        def build(self, **data):
            struct_builder(self, **data)
            return self
