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
    DEFAULT_WHATSAPP_MSG = "אשמח להזמין ניקוי ספה"
    DEFAULT_PHONE = '0585005617'
    WHATSAPP_LINK = 'https://api.whatsapp.com/send/?phone=972{phone}&text={text}&type=phone_number&app_absent=0'
    DEFAULT_WHATSAPP_LINK = WHATSAPP_LINK.format(phone=DEFAULT_PHONE, text=DEFAULT_WHATSAPP_MSG)


cleaneril.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{FILE_NAME_DB}.db"
cleaneril.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # // default
cleaneril.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
cleaneril.secret_key = binascii.hexlify(os.urandom(8)).decode()
cleaneril_db = SQLAlchemy(cleaneril)
migrate = Migrate(cleaneril, cleaneril_db)




class StateDocument(IntFlag):
    DRAFT           = 1<<0
    SAVED           = 1<<1


class ManagerPermissions(IntFlag):
    VIEW            = 1<<0
    EDIT            = 1<<1




