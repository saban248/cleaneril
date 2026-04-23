import time
from dataclasses import dataclass
from datetime import datetime, timezone

from api.databases import orders
from api.databases.orders import get_clean_order_done
from api.databases.ptc import StateOrder

@dataclass
class GraphFunds:
    date:str            = None
    amount:int          = None
    average_income:int = None
    average_expense:int= None



class AnalyticsData:

    def __init__(self, manager_id:str, date_from:float = None, date_to:float = None, cache:bool = True):
        self.__mid = manager_id
        self.__df = date_from or 0
        self.__dt = date_to or time.time()
        self.__cache = cache

        self.__od = None

    def __get_clean_orders_by_stat(self, stat:StateOrder):
        _orders = orders.get_clean_order_by_date(self.__mid, self.__df, self.__dt, stat=stat)
        return _orders.all()

    def orders_done(self):
        if self.__od and self.__cache:return self.__od
        self.__od=self.__get_clean_orders_by_stat(StateOrder.DONE)
        return self.__od

    def orders_done_count_ever(self):
        return len(orders.get_clean_order_by_date(self.__mid, 0, time.time()).all())

    def orders_wait(self):
        return self.__get_clean_orders_by_stat(StateOrder.WAIT)

    def orders_canceled(self):
        return self.__get_clean_orders_by_stat(StateOrder.CANCELED)

    def orders_canceled_count(self):
        return len(self.orders_canceled())

    def orders_canceled_count_ever(self):
        return len(orders.get_clean_order_by_date(self.__mid, 0, time.time()).all())

    def orders_closed(self):
        return self.__get_clean_orders_by_stat(StateOrder.CLOSED)

    def get_orders_done_by_year(self, year:int):
        start = datetime(year, 1, 1, tzinfo=timezone.utc).timestamp()
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc).timestamp()
        return orders.get_clean_order_by_date(self.__mid, start, end, False)

    def income(self):
        income = 0
        _orders = self.orders_done()
        for order in _orders:
            income += (order.price - order.off_price)
        return income

    def income_ever(self):
        income = 0
        _orders = orders.get_clean_order_by_date(self.__mid, 0, time.time()).all()
        for order in _orders:
            income += (order.price - order.off_price)
        return income

    def off_price(self):
        off_price = 0
        _orders = self.orders_done()
        for order in _orders:
            off_price += order.off_price
        return off_price

    def expenses(self):
        expenses = 0
        _orders = self.orders_done()
        for order in _orders:
            expenses += order.expense
        return expenses

    def expenses_ever(self):
        expenses = 0
        _orders = orders.get_clean_order_by_date(self.__mid, 0, time.time()).all()
        for order in _orders:
            expenses += order.expense

        return expenses

    def get_average_income_orders(self) -> float:
        _orders = self.orders_done()
        total_income = self.income()
        return float(f"{total_income/(len(_orders) or 1):.1f}")

    def get_average_income_orders_ever(self):
        orders_count = self.orders_done_count_ever()
        income_ever = self.income_ever()
        return float(f"{income_ever/(orders_count or 1):.1f}")

    def get_average_expense_orders(self) -> float:
        _orders = self.orders_done()
        return float(f"{self.expenses()/(len(_orders) or 1):.1f}")

    def get_average_expense_orders_ever(self):
        orders_count = self.orders_done_count_ever()
        expense_ever = self.expenses_ever()
        return float(f"{expense_ever/(orders_count or 1):.1f}")

    def get_average_income_orders_month(self, year:int, month:int):
        _orders = self.orders_done()
        income = 0
        length_orders = 0
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            if date.year == year and month == date.month:
                income += (order.price - order.off_price)
                length_orders+=1

        if not length_orders:return 0
        return float(f"{income / length_orders:.1f}")

    def get_average_expense_orders_month(self, year:int, month:int):
        _orders = self.orders_done()
        expense = 0
        length_orders = 0
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            if date.year == year and month == date.month:
                expense += order.expense
                length_orders+=1

        if not length_orders:return 0
        return float(f"{expense / length_orders:.1f}")

    def get_graph_funds(self, year:int):
        data = []
        _orders = self.get_orders_done_by_year(year)
        for order in _orders:
            date = datetime.fromtimestamp(float(order.date))
            item = GraphFunds()
            item.date = date.strftime("%Y.%m.%d")
            item.amount = order.price - order.off_price
            item.average_income = self.get_average_income_orders_month(date.year, date.month)
            item.average_expense = self.get_average_expense_orders_month(date.year, date.month)
            data.append(item.__dict__)

        return data