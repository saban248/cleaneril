from api.data.ptc import AnalyticsData
from api.databases import orders
from api.databases.ptc import StateOrder


class DataOrders(AnalyticsData):

    def __init__(self, *args):
        super().__init__(*args)


