from typing import Union
from api.ptc import generate_hex

from api.databases.ptc import cleaneril_db, StateDocument


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



class ApiCards:

    @staticmethod
    def get_cards(source:bool = True, **kwargs) -> list[Union[dict, Cards]]:
        cards = Cards.query.filter_by(**kwargs).all()
        if not cards:
            return []
        if source:
            return cards
        for card in cards:del card["_sa_instance_state"]

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
    def add_card(state:StateDocument|int, title:str, off:bool, off_price:int,img_path:str, description:str):
        is_exist = ApiCards.get_cards(state=int(state), title=title, off=off, img_path=img_path)
        if is_exist:return 1
        new = Cards()
        new.card_id = generate_hex(7)
        new.state = int(state)
        new.title = title
        new.off = off
        new.off_price = off_price
        new.img_path = img_path
        new.description = description
        cleaneril_db.session.add(new)
        cleaneril_db.session.commit()

        return 0



