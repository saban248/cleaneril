from api.openformat.formatters.record import OFRecordBuilder
from api.openformat.formatters.ptc import alpha, numeric, decimal_field, format_date


def build_100c(row_number,vat_number,receipt):
    r = OFRecordBuilder()
    r.add(alpha("100C", 4))
    r.add(numeric(row_number, 9))
    r.add(numeric(vat_number, 9))
    r.add(numeric(320, 3))
    r.add(alpha(receipt.number, 20))
    r.add(format_date(receipt.date))
    r.add(alpha("", 4))
    r.add(alpha(receipt.customer_name, 50))
    r.add(alpha("", 50))
    r.add(alpha("", 10))
    r.add(alpha("", 30))
    r.add(alpha("", 8))
    r.add(alpha("", 30))
    r.add(alpha("", 2))
    r.add(alpha("", 15))
    r.add(numeric("", 9))
    r.add(numeric("", 8))
    r.add(alpha("", 15))
    r.add(alpha("", 3))
    r.add(decimal_field(receipt.total, 12))
    r.add(decimal_field(0, 12))
    r.add(decimal_field(receipt.total - receipt.vat,12))
    r.add(decimal_field(receipt.vat, 12))
    r.add(decimal_field(receipt.total, 12))

    return r.build()


