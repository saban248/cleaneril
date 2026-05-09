from api.openformat.ptc import OFConfig


def write_to_bkmvd(data:str):
    with open(OFConfig.filename_bkmv_data, "w",encoding="iso-8859-8",newline="") as f:
        f.write(data)


def write_to_ini(data:str):
    with open(OFConfig.filename_ini, "w",encoding="iso-8859-8",newline="") as f:
        f.write(data)