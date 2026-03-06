from typing import Union

from api.databases.company import ApiCompany
from api.databases.ptc import cleaneril_db, ManagerPermissions
from api.ptc import generate_hex


class Employee(cleaneril_db.Model):
    __tablename__ = "employee"
    key = cleaneril_db.Column(cleaneril_db.Integer, nullable=False, primary_key=True)
    username = cleaneril_db.Column(cleaneril_db.String(64), nullable=False)
    permission = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)
    password = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    employee_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    phone = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    idc = cleaneril_db.Column(cleaneril_db.String(14), nullable=False)
    manager_id = cleaneril_db.Column(cleaneril_db.String(32), nullable=False)
    profit_sharing = cleaneril_db.Column(cleaneril_db.Integer, nullable=False)


class ApiEmployee:
    @staticmethod
    def create_employee(name:str, pwd:str, permission:int, phone:str, idc:str, mid:str, ps:int):
        employee = ApiEmployee.get_employees(username=name, password=pwd).first()
        if employee:
            return employee

        new_employee = Employee()
        new_employee.username = name
        new_employee.permission = permission
        new_employee.password = pwd
        new_employee.employee_id = generate_hex(15)
        new_employee.phone = phone
        new_employee.idc = idc
        new_employee.manager_id = mid
        new_employee.profit_sharing = ps
        cleaneril_db.session.add(new_employee)
        cleaneril_db.session.commit()
        return new_employee

    @staticmethod
    def get_employees(source:bool = True, **kwargs):
        employees = Employee.query.filter_by(**kwargs)
        if source:
            return employees

        for employee in employees: del employee.__dict__['_sa_instance_state']
        return employees

    @staticmethod
    def auth(**kwargs):
        manager = ApiEmployee.get_employees(**kwargs)
        if not manager.first():
            return 1

        return 0


