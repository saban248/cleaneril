import binascii
import os
from datetime import timedelta
from enum import IntFlag

from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


FILE_NAME_DB = "cleaneril"
cleaneril = Flask(FILE_NAME_DB, template_folder=os.path.join("client", "pages"),
                  static_folder=os.path.join("client", "static"))

class ServerConfig:
    COMPANY_NAME        = 'הברקה בדקה'
    FOLDER_IMAGE_PATH   = os.path.join(os.path.basename(cleaneril.static_folder), "images")
    FOLDER_IMAGE_BA   = os.path.join(FOLDER_IMAGE_PATH, "ba")
    DEFAULT_IMAGE_CARD  = os.path.join(FOLDER_IMAGE_BA,'example.jpg')
    FOLDER_LOGOS_PATH = os.path.join(FOLDER_IMAGE_PATH, "logo")
    DEFAULT_COMPANY_LOGO = "default_logo.png"
    DEFAULT_WHATSAPP_MSG = "אשמח להזמין ניקוי ספה"
    DEFAULT_PHONE = '0585005617'
    WHATSAPP_LINK = 'https://api.whatsapp.com/send/?phone=972{phone}&text={text}&type=phone_number&app_absent=0'
    DEFAULT_WHATSAPP_LINK = WHATSAPP_LINK.format(phone=DEFAULT_PHONE, text=DEFAULT_WHATSAPP_MSG)
    DEFAULT_COMPANY_EMAIL = "example@company.com"


cleaneril.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{FILE_NAME_DB}.db"
cleaneril.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # // default
cleaneril.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
cleaneril.secret_key = binascii.hexlify(os.urandom(8)).decode()
cleaneril_db = SQLAlchemy(cleaneril)
migrate = Migrate(cleaneril, cleaneril_db)




class StateDocument(IntFlag):
    DRAFT           = 1<<0
    SAVED           = 1<<1


class StateClient(IntFlag):
    WAIT            = 1<<0
    CLOSED          = 1<<1
    CANCELED        = 1<<2
    DONE            = 1<<3

    #mask
    ALL = WAIT|CLOSED|CANCELED|DONE

class ManagerPermissions(IntFlag):
    VIEW            = 1<<0
    EDIT            = 1<<1
    ADMIN           = 1<<2
    ROOT            = 1<<3




