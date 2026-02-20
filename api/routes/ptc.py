import json
import os.path
from dataclasses import dataclass
from enum import Enum, IntFlag

from api.databases.ptc import ServerConfig, StateClient


class ClientLeadFrom(IntFlag):
    TIKTOK          = 1<<0
    INSTEGRAM       = 1<<1
    FACEBOOK        = 1<<2
    GOOGLE          = 1<<3
    WHATSAPP        = 1<<4




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
    client_editor = 1<<4
    client_delete = 1<<5
    client_save = 1<<6
    client_view = 1<<7
    client_state = 1<<8
    funds_income = 1<<9


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
    class Dashboard:
        s:int               = None

        def build(self, **data):
            state:str = data.get("s", 0)

            if not state or not state.isdigit():
                self.s = StateClient.ALL
            else:
                self.s = int(state)
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
        phone:str       = None
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
            if not self.phone:
                self.phone = ServerConfig.DEFAULT_PHONE
            if self.o:
                self.wt = f'{self.wt} כולל {self.op}% הנחה '
            self.wtl = ServerConfig.WHATSAPP_LINK.format(phone=self.phone,
                                                                 text=self.wt)

            return self

    @dataclass
    class ClientEditor:
        ci:str              = None
        s:StateClient       = None
        phone:str               = None
        o:bool              = None
        op:int              = None
        fn:str              = None
        address:str          = None
        i:str               = None
        lf:int              = None
        date:float          = None
        notes:str           = None
        price:int           = None
        vat:bool            = None
        def build(self, **data):
            struct_builder(self, **data)
            self.o = bool(self.o)
            self.vat = bool(self.vat)
            if self.s:
                self.s = int(self.s)
            if self.op:
                self.op = int(self.op)
            if self.price:
                self.price = int(self.price)
            if self.lf:
                self.lf = int(self.lf)
            if self.date:
                self.date = float(self.date)
            if self.i:
                self.i = json.loads(self.i)
            self.get_full_price()

            return self

        def get_full_price(self):
            if not self.price or not self.i:return
            price = 0
            for key, value in self.i.items():
                price += value['price']

            self.price = price

    @dataclass
    class Funds:
        year:int        = None

        def build(self, **data):
            struct_builder(self, **data)
            self.year = int(self.year)

            return self



