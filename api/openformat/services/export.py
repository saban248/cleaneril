from api.openformat.records.r_100A import build_100a
from api.openformat.records.r_100C import build_100c



class OFExporter:

    def __init__(self):
        pass

    def export(self, receipts):
        rows = []
        file_id = 555555555555555
        row_number = 1
        record_a = build_100c( row_number,"123456789",file_id)
        rows.append(record_a)
        row_number += 1
        for receipt in receipts:
            record_c = build_100c( row_number,"123456789",receipt)
            rows.append(record_c)
            row_number += 1

        return "".join(rows)