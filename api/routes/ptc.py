import json
import os.path
import time
from dataclasses import dataclass
from enum import Enum, IntFlag

from api.databases.ptc import ServerConfig, StateClient


class ClientLeadFrom(IntFlag):
    TIKTOK          = 1<<0
    INSTEGRAM       = 1<<1
    FACEBOOK        = 1<<2
    GOOGLE          = 1<<3
    WHATSAPP        = 1<<4


class CalenderClients(IntFlag):
    TOMORROW        = 1<<0
    DAY             = 1<<1
    WEEK            = 1<<2
    DWEEK           = 1<<3
    MONTH           = 1<<4
    FOREVER         = 1<<5

def get_calender_client(cc:int):
    __day__ = 3600 * 24
    match cc:
        case CalenderClients.DAY:
            return __day__
        case CalenderClients.WEEK:
            return __day__ * 7
        case CalenderClients.DWEEK:
            return __day__ * 14
        case CalenderClients.MONTH:
            return __day__*31
        case CalenderClients.FOREVER:
            return float("inf")
    return 0


class ApiUploadFile(IntFlag):
    CARD            = 1<<0
    LOGO            = 1<<1


def is_bwt_date(client_date:float, cc:int):
    t = time.time() - client_date
    if CalenderClients.FOREVER&cc:return True
    if CalenderClients.TOMORROW&cc:
        return 0 <= client_date-time.time() < (3600*24)
    if t<0:return False

    return t<=get_calender_client(cc)


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
    create_account = 1<<3
    terms = 1<<4


class RouteApi(RoutePagesBase):
    do_auth = 1<<0
    api     = 1<<1
    up_image = 1<<2



class Pages(IntFlag):
    home = 1<<0
    auth = 1<<1
    dashboard = 1<<2
    register = 1<<3
    terms = 1<<4

    def __str__(self):
        return self.__repr__()
    @property
    def __root__(self):
        return self.name+"/"

    @property
    def md(self):
        return self.__root__+self.name+".md"
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
    conf_company = 1<<10
    client_workers = 1<<11
    worker_editor = 1<<12
    worker_view = 1<<13
    worker_save = 1<<14
    worker_delete = 1<<15
    calendar = 1<<16


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
        c:int               = None

        def build(self, **data):
            state:str = data.get("s", 0)
            calender:str = data.get("c", 0)

            if not state or not state.isdigit():self.s = StateClient.ALL
            else:self.s = int(state)
            if not calender or not calender.isdigit():self.c = CalenderClients.FOREVER
            else:self.c = int(calender)
            if not self.s:self.s = StateClient.ALL
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
        ex:float       = None
        worker:str      = None
        ps:int          = None
        coordinate:list      = None
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
            if self.ex:
                self.ex = float(self.ex)
            if self.ps:
                self.ps = int(self.ps)
            else:
                self.ps = 0
            if not self.coordinate:
                self.coordinate = [32.18,34.87]

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

    @dataclass
    class Company:
        #company name
        c_name:str        = None
        c_desc:str        = None
        c_owner:str      = None
        c_email:str     = None
        c_vat:bool      = None
        c_vat_code:int      = None
        c_phone:str     = None
        c_gpse:int      = None

        def build(self, **data):
            struct_builder(self,**data)

            if self.c_vat is not None:
                self.c_vat = bool(self.c_vat)
            if self.c_vat_code:
                self.c_vat_code = int(self.c_vat_code)
            if self.c_gpse:
                self.c_gpse = int(self.c_gpse)
            return self

    @dataclass
    class Employee:
        e_name:str          = None
        e_pwd:str           = None
        e_phone:str         = None
        e_idc:str           = None
        wid:str             = None
        ps:int              = None
        pvat:bool           = None
        permission:int      = None

        def build(self, **data):
            struct_builder(self, **data)
            if self.permission:
                self.permission = int(self.permission)
            if self.ps:
                self.ps = int(self.ps)
            if self.pvat is not None:
                self.pvat = bool(self.pvat)
            return self


    @dataclass
    class Calendar:
        month:int          = None
        year:int          = None

        def build(self, **date):
            struct_builder(self, **date)
            if self.month:self.month = int(self.month)
            if self.year:self.year = int(self.year)

            return self
