from datetime import datetime
from typing import Generator

from api.databases.clients import Clients
from api.databases.ptc import StateClient


class ApiFunds:

    @staticmethod
    def get_done_client():
        clients = Clients.query.filter_by(state=StateClient.DONE).all()
        return clients

    @staticmethod
    def get_year_client(year:int) :
        clients:list[Clients] = ApiFunds.get_done_client()
        for client in clients:
            if not datetime.fromtimestamp(float(client.date)).year == year:
                continue
            yield client

    @staticmethod
    def get_income_funds():
        income = 0
        clients:list[Clients] = ApiFunds.get_done_client()
        for client in clients:
            income += (client.price-client.off_price)

        return income

    @staticmethod
    def get_expense_funds():return 0
    @staticmethod
    def get_profit_funds():return ApiFunds.get_income_funds()

    @staticmethod
    def get_total_off_price():
        off_price = 0
        clients:list[Clients] = ApiFunds.get_done_client()
        for client in clients:
            off_price += client.off_price

        return off_price

    @staticmethod
    def get_client_profit_years(year:int):
        data = []
        clients = ApiFunds.get_year_client(year)
        for client in clients:
            cd = {"date": datetime.fromtimestamp(float(client.date)).strftime("%Y.%m.%d"), "amount": client.price - client.off_price}
            data.append(cd)

        return data

    @classmethod
    def get_average_income_per_client_ever(cls) -> float:
        clients = ApiFunds.get_done_client()
        total_profit = ApiFunds.get_profit_funds()
        return float(f"{total_profit/(len(clients) or 1):.2f}")

    @classmethod
    def get_average_expense_per_client_ever(cls) -> float:
        return 0
