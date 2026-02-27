from api.databases.manager import new_manager_hb
from api.routes.r_json import *
from api.routes.r_pages import *
from api.databases.ptc import *




if __name__ == "__main__":
    print(os.path.join(os.path.basename(os.path.dirname(cleaneril.static_folder)), str(os.path.join(ServerConfig.FOLDER_IMAGE_BA, "kok.jpg"))))
    with cleaneril.app_context():
        cleaneril_db.create_all()
        new_manager_hb()

    cleaneril.run(host="0.0.0.0", port=80, debug=True)