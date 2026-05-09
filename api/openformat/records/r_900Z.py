from api.openformat.formatters.record import OFRecordBuilder
from api.openformat.formatters.ptc import numeric,alpha


def build(row_number,vat_number,file_id, total_rows):

    r = OFRecordBuilder()
    r.add(alpha("900Z", 4))
    r.add(numeric(row_number, 9))
    r.add(numeric(vat_number, 9))
    r.add(numeric(file_id, 15))
    r.add(alpha("&1.31OF&", 8))
    r.add(numeric(total_rows,15))
    r.add(alpha("", 50))
    return r.build()

