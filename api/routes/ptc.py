from enum import Enum, IntFlag


class RoutePagesBase(Enum):

    @property
    def code(self):
        return super().value

    @property
    def path(self):
        return f"/{super().name}"


class RoutePages(RoutePagesBase):

    home = 1


class RouteApi(RoutePagesBase):
    ...



class Pages(IntFlag):
    home = 1<<0

    def __str__(self):
        return self.__repr__()
    @property
    def __root__(self):
        return self.name+"/"
    @property
    def html(self):
        return self.__root__+self.name+'.html'
    @property
    def js(self):
        return self.__root__+self.name+".js"
    @property
    def css(self):
        return self.__root__+self.name+".css"

