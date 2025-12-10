from api.routes.r_json import *
from api.routes.r_pages import *
from api.databases.ptc import *



if __name__ == "__main__":
    with cleaneril.app_context():
        cleaneril_db.create_all()
    cleaneril.run(host="0.0.0.0", port=80, debug=True)