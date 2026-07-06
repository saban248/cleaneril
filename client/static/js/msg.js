

const CODES = {
    registerNotFinished:16
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
            title: "יצירת הזמנות ניקוי",
            description: "יצירת הזמנת ניקוי חדשה.",
            icon:'fa-solid fa-file-lines',
        },
        [OrderFeature.SHARE]: {
            title: "שיתוף הזמנה",
            description: "שליחת תמונת הזמנה ללקוח.",
            icon:'fa-solid fa-share-nodes',
        },
        [OrderFeature.DUPLICATE]: {
            title: "שכפול הזמנה",
            description: "יצירת עותק של הזמנה קיימת.",
            icon:'fa-solid fa-copy',
        },
        [OrderFeature.SUMMARY]: {
            title: "סיכום וסטטיסטיקות לקוח",
            description: "צפייה בסיכום ההזמנות והסטטיסטיקות של כל לקוח. ",
            icon:'fa-solid fa-chart-simple',
        },
        [OrderFeature.SMS_REMINDER]: {
            title: "תזכורת ללקוח SMS",
            description: "שליחת תזכורת ללקוח 24 השעות לפני ההגעה.",
            icon:'fa-solid fa-message',
        }
    },

    workers: {
        [WorkerFeature.CREATE]: {
            title: "הוספת  עובדים לעסק",
            description: "הוספת עובדים חדשים למערכת.",
            icon:'fa-solid fa-user-plus',
        }
    },

    invoices: {
        [InvoiceFeature.CREATE]: {
            title: "יצירת חשבוניות",
            description: "יצירת חשבוניות וקבלות.",
            icon:'fa-solid fa-file-invoice',
        }
    },

    reports: {
        [ReportsFeature.GRAPH_VIEW]: {
            title: "גרפים של פעילות העסק",
            description: "צפייה בגרפים של פעילות העסק.",
            icon:'fa-solid fa-chart-line',
        }
    }
};