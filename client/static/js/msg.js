

const CODES = {
    registerNotFinished:14
}
const message = {
    EfetchClients: "שגיאה בהצגת לקוחות",
    EfetchOrders:"שגיאה בהצגת ההזמנות",
    createInvoice:'יוצר קבלה חדשה',
    EneedRefresh: "תקלה בהצגת הנתונים, רענן את העמוד",
    IunsaveOrder: " הפרטים לא נשמרו, להמשיך?",
    WdeleteOrder: "ההזמנה תמחק לצמיתות, להמשיך?",
    EselectReceipt:"שגיאה בבחירת הקבלה הנוכחית",
    notice:"שם לב",
    WdeleteCard:"הכרטיס מודעה יימחק, להמשיך?",
    WdeleteWorker:"העובד יימחק מהמערכת, להמשיך?",
    WdeleteReceipt:"הקבלה תמחק לצמיתות, להמשיך?",
    IAboutCreateReceipt:`לפני שאתה מדפיס קבלה, האם כל הפרטים נכונים?.\n לא ניתן לשנות אחרי הדפסה`,
    Ilogout:"יוצא מהמערכת..",
    WDeleteManagerAccount:"למחוק לצמיתות את המנוי? ימחקו כל התונים"
    
}


const FeatureDetails = {
    orders: {
        [OrderFeature.CREATE]: {
            title: "יצירת הזמנה חדשה",
            description: "יצירת הזמנת ניקוי חדשה."
        },
        [OrderFeature.SHARE]: {
            title: "שיתוף הזמנה",
            description: "שליחת קישור להזמנה ללקוח."
        },
        [OrderFeature.DUPLICATE]: {
            title: "שכפול הזמנה",
            description: "יצירת עותק של הזמנה קיימת."
        },
        [OrderFeature.SUMMARY]: {
            title: "סיכום לקוח",
            description: "צפייה בהיסטוריית הלקוח."
        }
    },

    workers: {
        [WorkerFeature.CREATE]: {
            title: "יצירת עובד",
            description: "הוספת עובדים חדשים למערכת."
        }
    },

    invoices: {
        [InvoiceFeature.CREATE]: {
            title: "יצירת חשבונית",
            description: "יצירת חשבוניות וקבלות."
        }
    },

    reports: {
        [ReportsFeature.GRAPH_VIEW]: {
            title: "גרפים",
            description: "צפייה בגרפים וסטטיסטיקות."
        }
    }
};