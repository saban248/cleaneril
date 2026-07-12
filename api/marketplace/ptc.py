from enum import IntFlag

# Market Place
class MPCleaningTypes(IntFlag):
    GENERAL         = 0
    UPHOLSTERY      = 1 << 0   # ספות, מזרנים, כורסאות, כסאות, ריפודי רכב...
    AIR_CONDITIONER = 1 << 1   # מזגנים
    CARPETS         = 1 << 2   # שטיחים
    WINDOWS         = 1 << 3   # חלונות
    FLOORS          = 1 << 4   # רצפות
    POST_RENOVATION = 1 << 6   # ניקיון לאחר שיפוץ
    OFFICE          = 1 << 7   # ניקיון משרדים
