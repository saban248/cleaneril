from typing import Union

from api.databases.company import ApiCompany
from api.databases.ptc import cleaneril_db, ManagerPermissions, ServerConfig
from api.ptc import generate_hex

unknown = 'unknown'

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
    def create_employee(employee_id:str, manager_id:str):
        worker = None
        if worker:
            worker = ApiEmployee.get_employees(employee_id=employee_id).first()
        if worker:return worker
        return ApiEmployee.add_employee(ServerConfig.DEF_wNAME, ServerConfig.DEF_wPWD, manager_id, employee_id)

    @staticmethod
    def add_employee(name:str, pwd:str, mid:str, employee_id:str = None, permission:int = ManagerPermissions.VIEW,
                        phone:str = unknown, idc:str = "0", ps:int = ServerConfig.DEFAULT_GPSE):
        employee = None
        if not employee_id:
            employee = Employee()
            employee.employee_id = generate_hex(15)
        else:
            employee = ApiEmployee.get_employees(employee_id=employee_id).first()

        employee.password = pwd
        employee.username = name
        employee.phone = phone
        employee.idc = idc
        employee.manager_id = mid
        employee.profit_sharing = ps
        employee.permission = permission
        if not employee_id:
            cleaneril_db.session.add(employee)
        cleaneril_db.session.commit()
        return employee

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


