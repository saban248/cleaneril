from api.openformat.formatters.record import OFRecordBuilder
from api.openformat.formatters.ptc import alpha, format_date, format_time, numeric

from datetime import datetime



class IniBuilder:
    def __init__(self):
        pass

    def build(self,vat_number,file_id,total_rows,output_path):

        now = datetime.now()
        r = RecordBuilder()
        r.add(alpha("000A", 4))
        r.add(alpha("", 5))
        r.add(numeric(total_rows,15))
        r.add(numeric(vat_number,9))
        r.add(numeric(file_id,15))
        r.add(alpha("&1.31OF&", 8))
        r.add(numeric(12345678,8))
        r.add(alpha("MY SYSTEM",20))
        r.add(alpha("1.0",20))
        r.add(numeric(123456789,9))
        r.add(alpha("YOUR COMPANY",20))
        r.add(numeric(1, 1))
        r.add(alpha(output_path, 50))
        r.add(numeric(0, 1))
        r.add(numeric(0, 1))
        r.add(numeric(0, 9))
        r.add(numeric(0, 9))
        r.add(alpha("", 10))
        r.add(alpha("BUSINESS",50))
        r.add(alpha("", 50))
        r.add(alpha("", 10))
        r.add(alpha("", 30))
        r.add(alpha("", 8))
        r.add(numeric(now.year, 4))
        r.add(numeric(0, 8))
        r.add(numeric(0, 8))
        r.add(format_date(now))
        r.add(format_time(now))
        r.add(numeric(0, 1))
        r.add(numeric(1, 1))
        r.add(alpha("ZIP",20))
        r.add(alpha("ILS", 3))
        r.add(numeric(0, 1))
        r.add(alpha("", 46))

        return r.build()