from twilio.rest import Client
from twilio.rest.verify.v2.service.verification import VerificationInstance
from twilio.rest.verify.v2.service.verification_check import VerificationCheckInstance

from api.databases.ptc import ServerConfig



def twilio_send_sms(phone:str) -> VerificationInstance:
    client = Client(ServerConfig.TWAS,ServerConfig.TWAT)

    verification = client.verify.v2.services(ServerConfig.TWVSS).verifications.create(to=phone,channel="sms")
    return verification


def twilio_verify_sms(phone:str, code:str) -> VerificationCheckInstance:
    client = Client(ServerConfig.TWAS,ServerConfig.TWAT)
    check = client.verify.v2.services(ServerConfig.TWVSS).verification_checks.create(to=phone,code=code)
    return check

