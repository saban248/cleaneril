from datetime import datetime
from typing import Generator

from api.databases import orders
from api.databases.clients import ClientProfile
from api.databases.orders import CleanOrder
from api.databases.ptc import StateOrder


class ApiFunds:
    def __init__(self, manager_id:str):
        self.__mid = manager_id
        self.od = self.get_done_orders
        self.fi = self.get_income_funds
        self.fe = self.get_expense_funds
        self.pf = self.get_profit_funds

    @property
    def get_done_orders(self):
        _orders = orders.get_clean_orders(manager_id=self.__mid, stat=StateOrder.DONE).all()
        return _orders

    def get_orders_by_year(self, year:int):
        ords:list[CleanOrder] = self.od
        for order in ords:
            if not datetime.fromtimestamp(float(order.date)).year == year:
                continue
            yield order

    @property
    def get_income_funds(self):
        income = 0
        _orders:list[CleanOrder] = self.od
        for order in _orders:
            income += (order.price - order.off_price)

        return income

    @property
    def get_expense_funds(self):
        _orders:list[CleanOrder] = self.od
        expense = 0
        for order in _orders:
            expense += order.expense

        return expense

    @property
    def get_profit_funds(self):
        return self.fi-self.fe

    @property
    def get_total_off_price(self):
        off_price = 0
        _orders:list[CleanOrder] = self.od
        for order in _orders:
            off_price += order.off_price

        return off_price

    def get_order_profit_years(self, year:int):
        data = []
        _orders = self.get_orders_by_year(year)
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            cd = {"date": date.strftime("%Y.%m.%d"),
                  "amount": order.price - order.off_price,
                  "ave_ipcm":self.get_average_income_per_client_month(date.year, date.month),
                  "ave_epcm":self.get_average_expense_per_client_month(date.year, date.month)
                  }
            data.append(cd)

        return data

    def get_average_income_per_client_ever(self) -> float:
        _orders = self.od
        total_income = self.fi
        return float(f"{total_income/(len(_orders) or 1):.1f}")

    def get_average_income_per_client_month(self, year:int, month:int):
        _orders = self.od
        income = 0
        length_orders = 0
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            if date.year == year and month == date.month:
                income += (order.price - order.off_price)
                length_orders+=1

        if not length_orders:return 0
        return float(f"{income / length_orders:.1f}")

    def get_average_expense_per_client_month(self, year:int, month:int):
        _orders = self.od
        expense = 0
        length_orders = 0
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            if date.year == year and month == date.month:
                expense += order.expense
                length_orders+=1

        if not length_orders:return 0
        return float(f"{expense / length_orders:.1f}")

    def get_average_expense_per_client_ever(self) -> float:
        _orders = self.od
        if not _orders:return 0
        total_expense = self.fe
        return  float(f"{total_expense/len(_orders):.1f}")
