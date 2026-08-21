from dataclasses import dataclass

from api.databases.ptc import ServerConfig


OTP_MESSAGE = """
cleanerIL OTP
קוד אימות #[code]
"""

def get_sms019_url_api():
    if ServerConfig.DEV_MODE:
        return SMS019Config.URL_API_TEST

    return  SMS019Config.URL_API


class SMS019Config:
    TOKEN = "eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdF9rZXkiOiI4NjgzMiIsInNlY29uZF9rZXkiOiI0MzQzODU1IiwiaXNzdWVkQXQiOiIxOS0wOC0yMDI2IDIxOjQxOjU4IiwidHRsIjo2MzA3MjAwMH0.oEToTmfahw1tVs54akpxEWQGkKuYchwGac62bA74y5k"
    URL_API = "https://019sms.co.il/api"
    URL_API_TEST = "https://019sms.co.il/api/test"
    SOURCE_PHONE = "0585005617"
    username = "syscmdexe"



API019_HEADERS = {
    "Authorization": f"Bearer {SMS019Config.TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}
