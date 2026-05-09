from api.openformat.formatters.record import OFRecordBuilder
from api.openformat.formatters.ptc import alpha, numeric, decimal_field, format_date



def build_120d(row_number,vat_number,document,payment,header_link):
    r = OFRecordBuilder()
    r.add(alpha("120D", 4))
    r.add(numeric(row_number, 9))
    r.add(numeric(vat_number, 9))
    r.add(numeric(document.document_type,3))
    r.add(alpha(document.number,20))
    r.add(numeric(payment.line_number,4))
    r.add(numeric(payment.method,1))
    r.add(numeric(payment.bank or 0,10))
    r.add(numeric(payment.branch or 0,10))
    r.add(numeric(payment.account or 0,15))
    r.add(numeric(payment.check_number or 0,10))
    r.add(format_date(payment.payment_date)
        if payment.payment_date
        else numeric(0, 8)
    )
    r.add(decimal_field(payment.amount,12))
    r.add(numeric(payment.credit_company or 0,1))
    r.add(alpha(payment.card_name or "",20))
    r.add( numeric(payment.credit_type or 0,1))
    r.add(alpha("", 0))
    r.add(alpha("", 0))
    r.add(alpha("", 0))
    r.add(alpha("", 0))
    r.add(alpha("", 7))
    r.add(alpha("", 0))
    r.add(format_date(document.date))
    r.add(numeric(header_link,7))
    r.add(alpha("", 60))

    return r.build()


