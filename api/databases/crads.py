from typing import Union
from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument, ServerConfig

unknown = 'unknown'

class Cards(cleaneril_db.Model):
    __tablename__ = "cards"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    card_id = cleaneril_db.Column(cleaneril_db.String(16), nullable=False)
    state   = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    title   = cleaneril_db.Column(cleaneril_db.String(100), nullable=False)
    off     = cleaneril_db.Column(cleaneril_db.Boolean, default=False)
    off_price = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    img_path = cleaneril_db.Column(cleaneril_db.String(248), nullable=False)
    description = cleaneril_db.Column(cleaneril_db.String(5000), nullable=False)
    whatsapp_text = cleaneril_db.Column(cleaneril_db.String, nullable=False)



class ApiCards:

    @staticmethod
    def get_cards(source:bool = True, **kwargs) -> Union[Cards, list[Union[dict, Cards]]]:
        cards = Cards.query.filter_by(**kwargs).all()
        if not cards:
            return []
        if source:
            return cards
        for card in cards.__dict__:del card["_sa_instance_state"]

        if cards.__len__()==1:
            return cards[0]
        return cards

    @staticmethod
    def get_drafts(source:bool = True, **kwargs):
        drafts = ApiCards.get_cards(source, state=StateDocument.DRAFT, **kwargs)
        return drafts

    @staticmethod
    def get_saved(source:bool = True, **kwargs):
        saved = ApiCards.get_cards(source, state=StateDocument.SAVED, **kwargs)
        return saved

    @staticmethod
    def create_card(card_id:str):
        card = None
        if card_id:
            card = ApiCards.get_cards(card_id=card_id).first()
        if card:return card
        return  ApiCards.add_card()
    @staticmethod
    def add_card(card_id:str = None, state:StateDocument|int = StateDocument.DRAFT,
                 title:str = unknown, off:bool = False,
                 off_price:int = 0, img_path:str = ServerConfig.DEFAULT_IMAGE_CARD,
                 description:str = unknown, whatsapp_text:str = unknown):

        if not card_id:
            card = Cards()
            card.card_id = generate_hex(7)
        else:
            card = ApiCards.get_cards(card_id=card_id).first()
        card.state = int(state)
        card.title = title
        card.off = off
        card.off_price = off_price
        card.img_path = img_path
        card.description = description
        card.whatsapp_text = whatsapp_text
        if not card_id:
            cleaneril_db.session.add(card)

        cleaneril_db.session.commit()

        return card



