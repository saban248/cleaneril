import io

import magic
from PIL import Image

from api.ptc import LOGO_APP_FILE_ALLOWED
from api.validator import core_msg


def is_logo_app_valid(buffer:bytes):
    __error__ = core_msg.ServerCode.General.something_wrong
    try:
        with Image.open(io.BytesIO(buffer)) as img:
            img.verify()
    except Exception as error:
        f"{error}"
        return __error__

    mime_types = magic.from_buffer(buffer, mime=True)
    if mime_types not in LOGO_APP_FILE_ALLOWED:
        return __error__

    return core_msg.ServerCode.success