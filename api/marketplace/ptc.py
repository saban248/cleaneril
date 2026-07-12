from enum import IntFlag


class MarketplaceApiCall(IntFlag):
    list_jobs = 1


class JobMarketplaceState(IntFlag):
    DONE = 1 << 0
    ESTABLISHED = 1 << 1
    AVAILABLE = 1 << 2




# Market Place
class MPCleaningTypes(IntFlag):
    GENERAL         = 1<<8
    UPHOLSTERY      = 1 << 0   # ספות, מזרנים, כורסאות, כסאות, ריפודי רכב...
    AIR_CONDITIONER = 1 << 1   # מזגנים
    CARPETS         = 1 << 2   # שטיחים
    WINDOWS         = 1 << 3   # חלונות
    FLOORS          = 1 << 4   # רצפות
    POST_RENOVATION = 1 << 6   # ניקיון לאחר שיפוץ
    OFFICE          = 1 << 7   # ניקיון משרדים


def mp_cleaning_types_text(f):
    match f:
        case MPCleaningTypes.GENERAL:
            return "כללי"
        case MPCleaningTypes.UPHOLSTERY:
            return "ריפודים"
        case MPCleaningTypes.AIR_CONDITIONER:
            return "מזגנים"
        case MPCleaningTypes.CARPETS:
            return "שטיחים"
        case MPCleaningTypes.WINDOWS:
            return "חלונות"
        case MPCleaningTypes.FLOORS:
            return "רצפות"
        case MPCleaningTypes.POST_RENOVATION:
            return "ניקיון לאחר שיפוץ"
        case MPCleaningTypes.OFFICE:
            return "ניקיון משרדים"
        case _:
            return "לא ידוע"