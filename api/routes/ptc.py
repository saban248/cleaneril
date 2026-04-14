import datetime
import json
import os.path
import time
from dataclasses import dataclass
from enum import Enum, IntFlag

from api.databases.general import unknown
from api.databases.ptc import ServerConfig, StateOrder


class ClientLeadFrom(IntFlag):
    TIKTOK          = 1<<0
    INSTEGRAM       = 1<<1
    FACEBOOK        = 1<<2
    GOOGLE          = 1<<3
    WHATSAPP        = 1<<4
    FRIENDS         = 1<<5


class OrderType(IntFlag):
    UPHOLSTERY      = 1<<0
    AIR_CONDITIONER = 1<<1

    # mask
    GENERAL         = UPHOLSTERY|AIR_CONDITIONER


class CalenderClients(IntFlag):
    TOMORROW        = 1<<0
    DAY             = 1<<1
    WEEK            = 1<<2
    DWEEK           = 1<<3
    MONTH           = 1<<4
    FOREVER         = 1<<5


class PaymentInvoice(IntFlag):
    BANK_TRANSFER = 1<<0
    CASH          = 1<<1
    CHECK         = 1<<2
    OTHER         = 1<<3

class InvoiceStatType(IntFlag):
    DRAFT           = 1<<0
    PAID            = 1<<1

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
    register = 1<<3


class RegisterApi(IntFlag):
    level1 = 1<<0
    level2 = 1<<1
    level3 = 1<<2
    level4 = 1<<3


class Pages(IntFlag):
    home = 1<<0
    auth = 1<<1
    dashboard = 1<<2
    register = 1<<3
    terms = 1<<4
    invoice = 1<<5


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

    @property
    def f_dashboard(self):
        return os.path.join(f'{self.dashboard.path}', self.html)


class ApiCall(IntFlag):
    card_editor = 1<<0
    card_draft = 1<<1
    card_delete = 1<<2
    card_save = 1<<3
    order_edit = 1 << 4
    order_delete = 1 << 5
    order_save = 1 << 6
    client_view = 1<<7
    order_stat = 1 << 8
    funds_income = 1<<9
    conf_company = 1<<10
    order_workers = 1 << 11
    worker_editor = 1<<12
    worker_view = 1<<13
    worker_save = 1<<14
    worker_delete = 1<<15
    calendar = 1<<16
    orders_list = 1 << 17
    invoice_view = 1<<18
    invoice_create = 1<<19
    invoice_list = 1<<20
    order_view = 1 << 21
    order_new  = 1<< 22


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

            if not state or not state.isdigit():self.s = StateOrder.ALL
            else:self.s = int(state)
            if not calender or not calender.isdigit():self.c = CalenderClients.FOREVER
            else:self.c = int(calender)
            if not self.s:self.s = StateOrder.ALL
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
    class ListOrders:
        fromY:int           = None
        toY:int             = None

        def build(self, **data):
            struct_builder(self, **data)
            default_year = datetime.datetime.now().year
            if not self.fromY:
                self.fromY = default_year-2
            else:
                self.fromY = int(self.fromY)
            if not self.toY:
                self.toY = default_year+1
            else:
                self.toY = int(self.toY)

            return self

    @dataclass
    class Client:
        cid:str       = None

        def build(self, **data):
            struct_builder(self, **data)
            return self


    @dataclass
    class CleanOrder:
        client_id           = None
        oi:str              = None
        s:StateOrder       = None
        phone:str               = None
        o:bool              = None
        op:int              = None
        fn:str              = None
        address:str          = None
        i:list               = None
        lf:int              = None
        date:float          = None
        notes:str           = None
        price:int           = None
        vat:bool            = None
        ex:float       = None
        workers:list      = None
        ps:int          = None
        coordinate:list      = None
        pt:int          = None
        pn:str          = None
        ot:int          = None
        def build(self, **data):
            struct_builder(self, **data)
            self.o = bool(self.o)
            self.vat = bool(self.vat)
            if not self.client_id:
                self.client_id = 0
            if self.s:
                self.s = int(self.s)
            else:
                self.s = StateOrder.WAIT
            if self.op:
                self.op = int(self.op)
            else:
                self.op = 0
            if self.price:
                self.price = int(self.price)
            else:
                self.price = 0
            if self.lf:
                self.lf = int(self.lf)
            else:
                self.lf = ClientLeadFrom.WHATSAPP
            if self.date:
                self.date = float(self.date)
            else:
                self.date = time.time()
            if self.i:
                self.i = json.loads(self.i)
            else:
                self.i = {}
            if self.ex:
                self.ex = float(self.ex)
            else:
                self.ex = 0
            if self.ps:
                self.ps = int(self.ps)
            else:
                self.ps = 0
            if not self.coordinate:
                self.coordinate = [32.18,34.87]
            if not self.pt:
                self.pt = PaymentInvoice.CASH
            else:
                self.pt = int(self.pt)
            if not self.pn:
                self.pn = str()
            if self.ot:
                self.ot = int(self.ot)
            else:
                self.ot = OrderType.GENERAL
            if not self.address:
                self.address = unknown
            if not self.notes:
                self.notes = unknown
            if not self.fn:
                self.fn = unknown
            if not self.phone:
                self.phone = unknown
            if not self.workers:
                self.workers = []
            self.get_full_price()


            return self

        def get_full_price(self):
            if not self.price or not self.i:return
            price = 0
            for key, value in self.i.items():
                price += int(value['price'])

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

    @dataclass
    class Register:
        username:str        = None
        password:str        = None
        xCSRF:str           = None
        c_name:str          = None
        c_desc:str          = None
        c_phone:str         = None
        o_name:str          = None
        c_email:str         = None
        mid:str             = None

        def build(self, **data):
            struct_builder(self, **data)

            return self

    @dataclass
    class Invoice:
        iid:str             = None
        cid:str             = None

        def build(self, **data):
            struct_builder(self, **data)

            return self



