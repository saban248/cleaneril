import os
from enum import IntFlag

from api.databases.ptc import ServerConfig


class OFFiles(IntFlag):
    BKMVDATA = 1<<0
    INI      = 1<<1


class OFConfig:
    FOLDER_NAME = 'openformat'
    OF_PATH         = os.path.join(ServerConfig.API_PATH, FOLDER_NAME)
    EXPORT_PATH     = os.path.join(OF_PATH, 'exports')
    filename_bkmv  = OFFiles.BKMVDATA.name
    filename_bkmv_txt = "txt." + str(filename_bkmv)
    filename_bkmv_zip = filename_bkmv + ".zip"
    filename_ini        = OFFiles.INI.name
    filename_ini_txt =  'txt.' + str(filename_ini)
    encoding            = 'iso-8859-8'
    VERSION             = '&1.31OF&'
    SOFTWARE_NUM        = 0
    INI_LENGTH          = 1280
    SOFTWARE_VAT_ID     = 0


