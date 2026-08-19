from dataclasses import dataclass




@dataclass(slots=True)
class OTPRequest:
    send_otp:SendOTP
    phone:str



@dataclass(slots=True)
class SendOTP:
    username: str


@dataclass(slots=True)
class User:
    username: str