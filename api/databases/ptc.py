import binascii
import os
from datetime import timedelta
from enum import Enum, IntFlag
from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy



class ServerConfig:
    FILE_NAME_DB        = "cleaneril"
    COMPANY_NAME        = 'הברקה בדקה'
    DEFAULT_IMAGE_CARD  = '/static/images/ba/example.jpg'

cleaneril = Flask(ServerConfig.FILE_NAME_DB, template_folder=os.path.join("client", "pages"),
                  static_folder=os.path.join("client", "static"))

cleaneril.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{ServerConfig.FILE_NAME_DB}.db"
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




