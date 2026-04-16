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
    list_clients = 1<<23
    invoice_delete = 1<<24




