from datetime import datetime
from typing import Generator

from api.databases.clients import Clients
from api.databases.ptc import StateOrder


class ApiFunds:

    @staticmethod
    def get_done_client():
        clients = Clients.query.filter_by(state=StateOrder.DONE).all()
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
    def get_expense_funds():
        clients = ApiFunds.get_done_client()
        expense = 0
        for client in clients:
            expense += client.expense

        return expense

    @staticmethod
    def get_profit_funds():
        return ApiFunds.get_income_funds()-ApiFunds.get_expense_funds()

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
            date = datetime.fromtimestamp(float(client.date))
            cd = {"date": date.strftime("%Y.%m.%d"),
                  "amount": client.price - client.off_price,
                  "ave_ipcm":ApiFunds.get_average_income_per_client_month(date.year, date.month),
                  "ave_epcm":ApiFunds.get_average_expense_per_client_month(date.year, date.month)
                  }
            data.append(cd)

        return data

    @staticmethod
    def get_average_income_per_client_ever() -> float:
        clients = ApiFunds.get_done_client()
        total_income = ApiFunds.get_income_funds()
        return float(f"{total_income/(len(clients) or 1):.1f}")

    @staticmethod
    def get_average_income_per_client_month(year:int, month:int):
        clients = ApiFunds.get_done_client()
        income = 0
        length_clients = 0
        for client in clients:
            date = datetime.fromtimestamp(float(client.date))
            if date.year == year and month == date.month:
                income += (client.price - client.off_price)
                length_clients+=1

        if not length_clients:return 0
        return float(f"{income / length_clients:.1f}")

    @staticmethod
    def get_average_expense_per_client_month(year:int, month:int):
        clients = ApiFunds.get_done_client()
        expense = 0
        length_clients = 0
        for client in clients:
            date = datetime.fromtimestamp(float(client.date))
            if date.year == year and month == date.month:
                expense += client.expense
                length_clients+=1

        if not length_clients:return 0
        return float(f"{expense/length_clients:.1f}")


    @staticmethod
    def get_average_expense_per_client_ever() -> float:
        clients = ApiFunds.get_done_client()
        if not clients:return 0
        total_expense = ApiFunds.get_expense_funds()
        return  float(f"{total_expense/len(clients):.1f}")

