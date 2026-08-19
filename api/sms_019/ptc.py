from dataclasses import dataclass


class SMS019Config:
    TOKEN = "eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdF9rZXkiOiI4NjgzMiIsInNlY29uZF9rZXkiOiI0MzQzODU1IiwiaXNzdWVkQXQiOiIxOS0wOC0yMDI2IDIxOjQxOjU4IiwidHRsIjo2MzA3MjAwMH0.oEToTmfahw1tVs54akpxEWQGkKuYchwGac62bA74y5k"
    URL_API = "https://019sms.co.il/api"





@dataclass(slots=True)
class SMS019Send:
    source:str
    destinations:list[str]
    message:str
    timing:None|str
    campaign_name:str
    includes_international:bool = False
    add_unsubscribe: int = 0
