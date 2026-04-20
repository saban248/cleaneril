from api.databases import orders
from api.databases.bridge import upgrade_from_clients_to_clean_order
from api.databases.manager import new_manager_hb
from api.routes.r_json import *
from api.routes.r_pages import *
from api.databases.ptc import *
from api.jfunc import *



if __name__ == "__main__":
    with cleaneril.app_context():
        cleaneril_db.create_all()
        new_manager_hb()
    cleaneril.run(host="0.0.0.0", port=80, debug=True)