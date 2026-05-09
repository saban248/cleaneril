from enum import IntFlag



class OFFiles(IntFlag):
    BKMVDATA = 1<<0
    INI      = 1<<1


class OFConfig:
    filename_bkmv_data  = OFFiles.BKMVDATA.name+'.txt'
    filename_ini        = OFFiles.INI.name+'.txt'
    encoding            = 'iso-8859-8'


