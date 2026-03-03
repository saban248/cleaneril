from typing import Union

from api.databases.ptc import cleaneril_db, ServerConfig
from api.ptc import generate_hex

unknown = 'unknown'

class Company(cleaneril_db.Model):
    __tablename__ = "settings"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    logo_path = cleaneril_db.Column(cleaneril_db.String(256), nullable=False)
    company_name = cleaneril_db.Column(cleaneril_db.String(60), nullable=False)
    owner_fullname = cleaneril_db.Column(cleaneril_db.String(60), nullable=False)
    company_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    company_description = cleaneril_db.Column(cleaneril_db.String(100), nullable=False)
    vat_company = cleaneril_db.Column(cleaneril_db.Boolean, nullable=False, default=False)
    company_phone = cleaneril_db.Column(cleaneril_db.String(20), nullable=False, default=False)
    company_email = cleaneril_db.Column(cleaneril_db.String(50), nullable=False, default=False)
    company_VAT = cleaneril_db.Column(cleaneril_db.String(32), nullable=False, default=False)


class ApiCompany:

    @staticmethod
    def get_companies(source:bool = True, **kwargs) -> Union[Company, list[Union[dict, Company]]]:
        companies = Company.query.filter_by(**kwargs)
        if source:
            return companies
        for company in companies:del company.__dict__["_sa_instance_state"]

        return companies

    @staticmethod
    def create_company(c_name:str, o_name:str, manager_id:str, c_vat:bool):
        company = Company.query.filter_by(manager_id=manager_id).first()
        if company:return 1
        new_company = Company()
        new_company.company_name = c_name
        new_company.owner_fullname = o_name
        new_company.manager_id = manager_id
        new_company.vat_company = c_vat
        new_company.company_id = generate_hex(15)
        new_company.logo_path = ServerConfig.DEFAULT_COMPANY_LOGO
        new_company.company_description = "unknown"
        new_company.company_phone = "unknown"
        new_company.company_email = ServerConfig.DEFAULT_COMPANY_EMAIL
        new_company.company_VAT = "000-000-000"

        cleaneril_db.session.add(new_company)
        cleaneril_db.session.commit()

        return 0

    @staticmethod
    def update_company_details(manager_id:str, c_name:str = None, o_name:str = None, c_vat:bool = None,
                               c_desc:str = None, c_phone:str = None, c_email:str = None, c_vat_code:str = None):
        company:Company = ApiCompany.get_companies(manager_id=manager_id).first()
        if not company:return 1
        if c_name:
            company.company_name = c_name
        if o_name:
            company.owner_fullname = o_name
        if c_vat:
            company.vat_company = c_vat
        if c_desc:
            company.company_description = c_desc
        if c_phone:
            company.company_phone = c_phone
        if c_email:
            company.company_email = c_email
        if c_vat_code:
            company.company_VAT = c_vat_code

        cleaneril_db.session.commit()

        return 0

    @staticmethod
    def change_logo(manager_id:str, logo_filename:str):
        company:Company = ApiCompany.get_companies(manager_id=manager_id).first()
        if not company:return 1

        company.logo_path = logo_filename
        cleaneril_db.session.commit()
        return 0