from typing import Callable

from sqlalchemy.orm import Query

from api.databases.ptc import cleaneril_db

unknown = 'unknown'

def get_columns_as_dict(query:Query) :
    return [{c.name: getattr(e, c.name) for c in e.__table__.columns} for e in query]


def get_columns(table:cleaneril_db.Model, source:bool = True, **kwargs):
    columns = table.query.filter_by(**kwargs)
    if source:
        return columns
    return get_columns_as_dict(columns)


def get_latest_columns(table:cleaneril_db.Model, key:Callable, **kwargs):
    columns = get_columns(table, True, **kwargs)
    return sorted(columns, key=lambda column: key(column), reverse=True)
