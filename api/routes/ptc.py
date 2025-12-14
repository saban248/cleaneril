import os.path
from dataclasses import dataclass
from enum import Enum, IntFlag

from api.databases.ptc import ServerConfig


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
    up_image = 1<<2



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
    card_draft = 1<<1
    card_delete = 1<<2
    card_save = 1<<3


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
    class CardEditor:
        action:int      = None
        ci:str          = None
        ct:str          = None
        wt:str          = None
        o:bool          = None
        op:int          = None
        imp:str         = None
        desc:str        = None
        wtl:str         = None
        def build(self, **data):
            struct_builder(self, **data)
            self.o = bool(self.o)
            if not self.desc:
                self.desc = "unknown"
            if not self.imp:
                self.imp = ServerConfig.DEFAULT_IMAGE_CARD
            else:
                self.imp = os.path.join(ServerConfig.FOLDER_IMAGE_BA, self.imp)
            if not self.wt:
                self.wt = ServerConfig.DEFAULT_WHATSAPP_MSG

            self.wtl = ServerConfig.DEFAULT_WHATSAPP_LINK.format(phone=ServerConfig.DEFAULT_PHONE,
                                                                 text=self.wt)

            return self
