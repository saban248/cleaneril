const CONFIG = {
    CARD_EDIT:false,
    WORKER_EDIT:false,
    WORKER_VIEW:false,
    CURRENT_PAGE:-1,
    IMG_ORDER:0
}
const ManagerPermissions = {
    VIEW:1<<0,
    EDIT:1<<1,
    ADMIN:1|2,
    ROOT:(1|2)|(1<<2)

}

function getManagerPermissionIconText(flag) {
    if (flag >= ManagerPermissions.ROOT)
        return ["root", "fa-solid fa-chess"];

    if (flag >= ManagerPermissions.ADMIN)
        return ["מנהל מערכת", "fa-solid fa-user-tie"];

    if (flag >= ManagerPermissions.EDIT)
        return ["עריכה", "fa-solid fa-pen"];

    return ["צפייה", "fa-solid fa-eye"];
}

const ManagerAccountStat = {
    ACTIVE:1<<0,
    PENDING:1<<1,
    PAUSE:1<<2,
    BANNED:1<<3,
    DELETED:1<<4
}
function getManagerAccountStatIconText(flag){
    switch (flag) {
        case ManagerAccountStat.ACTIVE:
            return ["פעיל", ""]    
        case ManagerAccountStat.PENDING:
            return ["ממתין", ""]
        case ManagerAccountStat.PAUSE:
            return ["מושהה", ""]
        case ManagerAccountStat.BANNED:
            return ["חסום", ""]
        case ManagerAccountStat.DELETED:
            return ["מחוק", ""]
    }
    return ["-", ""]
}

const SocialMedia = {
    TIKTOK:1,
    INSTEGRAM:2,
    FACEBOOK:4,
    GOOGLE:8,
    WHATSAPP:1<<4

}
const StateOrder = {
    WAIT            :1<<0,
    CLOSED          :1<<1,
    CANCELED        :1<<2,
    DONE            :1<<3
}
function getStateClient(state) {
    const result = [];

    for (const key in StateClient) {
        if (state & StateClient[key]) {
            result.push(key);
        }
    }
    if (result.length==1){
        return result[0]
    }
    return result;
}
function getStateClientText(s){
    if (s & StateOrder.WAIT) return "לא נסגר";
    if (s & StateOrder.CLOSED) return "בהמתנה";
    if (s & StateOrder.CANCELED) return "בוטל";
    if (s & StateOrder.DONE) return "הושלם!";
    return "לא ידוע";
}


const CalanderClients = {
    TOMORROW:   1<<0,
    DAY:        1<<1,
    WEEK:       1<<2,
    DWEEK:      1<<3,
    MONTH:      1<<4,
    FOREVER:    1<<5
}
function getCalenderClient(cc) {
    const result = [];

    for (const key in CalanderClients) {
        if (cc & CalanderClients[key]) {
            result.push(key);
        }
    }
    if (result.length==1){
        return result[0]
    }
    return result;
}


function getCalenderClientText(cc){
    switch (cc){
        case cc&CalanderClients.TOMORROW:
            return "מחר"
        case cc&CalanderClients.DAY:
            return "היום"
        case cc&CalanderClients.WEEK:
            return "השבוע"
        case cc&CalanderClients.DWEEK:
            return "שבועיים"
        case cc&CalanderClients.MONTH:
            return "החודש" 
        case cc&CalanderClients.FOREVER:
            return "תמיד"
        
        default:
            return "תמיד"
    }
}


function getPaymentStatText(pt){
    switch (pt){
        case pt&PaymentInvoice.BANK_TRANSFER:
            return "העברה"
        case pt&PaymentInvoice.CASH:
            return "מזומן"
        case pt&PaymentInvoice.CHECK:
            return "צ'יק"
        case pt&PaymentInvoice.OTHER:
            return "אחר / לא צוין"
    }
}


const InvoiceAboutDeleted = {
    CANCELED:1<<0,
    REFUND:1<<1,
    MISSINFO:1<<2
}

function getInvoiceAboutDeletedText(flag){
    switch (flag){
        case InvoiceAboutDeleted.CANCELED:
            return "עיסקה בוטלה"
         case InvoiceAboutDeleted.REFUND:
            return "החזר כספי"
         case InvoiceAboutDeleted.MISSINFO:
            return "פרטים קבלה שגויים" 
    }
    return "לא צויין"
}

function getSocialMedia(social) {
    const result = [];

    for (const key in SocialMedia) {
        if (social & SocialMedia[key]) {
            result.push(key);
        }
    }
    if (result.length==1){
        return result[0]
    }
    return result;
}


const PageManager = {
    GIFTS:1<<0,
    LINKS:1<<1,
    CARDS:1<<2,
    CLIENTS:1<<3,
    FUNDS:1<<4,
    SETTINGS:1<<5,
    WORKERS:1<<6,
    CALENDAR:1<<7,
    INVOICES:1<<8,
    WSHARE:1<<9,
    SUBSCRIPTIONS:1<<10

}

function getPageManager(page) {
    const result = [];

    for (const key in PageManager) {
        if (page & PageManager[key]) {
            result.push(key);
        }
    }
    if (result.length==1){
        return result[0]
    }
    return result;
}

const mPermissions = {
    VIEW:1<<0,
    EDIT:1<<1,
    ADMIN:1<<2
}

const PageRoute = {
    createAccount:"/create_account",
    auth:"/auth"
}
const ApiRoute = {
    auth:"do_auth",
    api:"api",
    upImage:"up_image",
    register: "register",
    logout:"logout",
    subs:"subscription"
}
const RegisterApi = {
    level0:1<<5,
    level1:1<<0,
    level2:1<<1,
    level3:1<<2,
    level4:1<<3,
    DONE:1<<4
}

const SubscriptionApi = {
    m_delete:1<<0,
    m_active:1<<1,
    m_pause:1<<2,
    m_pending:1<<3,
    m_banned:1<<4,
    manager_dashboard:1<<5,
    manager_workers:1<<6,
    approve_assets:1<<7
}


const ApiCall = {
    card_editor :1<<0,
    card_draft:1<<1,
    card_delete:1<<2,
    card_save:1<<3,
    order_edit:1<<4,
    order_delete:1<<5,
    order_save:1<<6,
    client_view:1<<7,
    client_state:1<<8,
    api_reports:1<<9,
    conf_company:1<<10,
    client_workers:1<<11,
    worker_editor:1<<12,
    worker_view:1<<13,
    worker_save:1<<14,
    worker_delete:1<<15,
    calendar:1<<16,
    orders_list:1<<17,
    invoice_view:1<<18,
    invoice_create:1<<19,
    invoice_list:1<<20,
    order_view:1<<21,
    order_new:1<<22,
    list_clients:1<<23,
    invoice_delete:1<<24,
    permissions:1<<25,
    list_managers:1<<26,
    list_companies:1<<27,
    alive:1<<28
}

const ReportsApi = {
    funds:1<<0,
    orders:1<<1,
    graph_funds:1<<2,
    graph_orders:1<<3
}

const ApiUploadFile = {
    CARD:1<<0,
    LOGO:1<<1
}

const ToastStat = {
    LOAD:1<<0,
    DONE:1<<1,
    ERROR:1<<2
}


const PaymentInvoice = {
    BANK_TRANSFER:1<<0,
    CASH:1<<1,
    CHECK:1<<2,
    OTHER:1<<3
}

const InvoiceStatType = {
    DRAFT:1<<0,
    PAID:1<<1
}
function getInvoiceStatTypeText(stat){
    switch (stat){
        case InvoiceStatType.DRAFT:
            return "טיוטה"
        case InvoiceStatType.PAID:
            return "שולם"
    }
}

const clientCardsView = {
    ORDER:1<<0,
    RECEIPT:1<<1,
    REPORTS:1<<2
}

const CleanOrderType = {
    UPHOLSTERY:1<<0,
    AIR_CONDITIONER:1<<1,
    GENERAL:1<<0|1<<1
}

function getCleanOrderTypeText(flag){
    switch (flag) {
        case CleanOrderType.UPHOLSTERY:
            return "ריפודים"
    
        case CleanOrderType.AIR_CONDITIONER:
            return "מזגנים"

        case CleanOrderType.GENERAL:
            return "כללי"
    }
    return getCleanOrderTypeText(CleanOrderType.GENERAL)
}

function getCleanOrderTypeTitle(flag){
    switch (flag) {
        case CleanOrderType.UPHOLSTERY:
            return "הזמנת ניקוי ריפודים"
        case CleanOrderType.AIR_CONDITIONER:
            return "הזמנת ניקוי מזגנים"
        case CleanOrderType.GENERAL:
            return "הזמנת ניקוי כללי"
    }
        
}

function getCleanOrderTypeIcon(flag){
    switch (flag) {
        case CleanOrderType.AIR_CONDITIONER:
            return "fa-solid fa-fan"
        case CleanOrderType.UPHOLSTERY:
            return "fa-solid fa-couch"
        case CleanOrderType.GENERAL:
            return "fa-solid fa-soap"
    }
    return getCleanOrderTypeIcon(CleanOrderType.GENERAL)
}



const subscriptionType = {
    MONTHLY:1<<0,
    YEARLY:1<<1
}

function getSubscriptionTypeText(flag){
    switch (flag) {
        case subscriptionType.MONTHLY:
            return "חודשי"
        case subscriptionType.YEARLY:
            return 'שנתי'
    }
    
    return 'הכל'
}

function getSubscriptionOrderText(flag){
    switch (flag){
        case 1 :
            return 'חדש'
        case 2:
            return "ישן"
    }
    return getSubscriptionOrderText(1)

}
const UserAccountSubscription = {
    FREE:1<<0,
    PREMIUM:1<<1
}
function getUserAccountSubscriptionText(flag){
    switch (flag) {
        case UserAccountSubscription.FREE:
            return "חינם"
        case UserAccountSubscription.PRIMIUM:
            return "פרימיום"
    }
}


const SubscriptionStat = {
    ACTIVE:1<<0,
    INACTIVE:1<<1,
    EXPIRED:1<<2
}



function getSubscriptionStatText(stat){
    switch (stat) {
        case SubscriptionStat.ACTIVE:
            return "פעיל"
        case SubscriptionStat.INACTIVE:
            return "לא פעיל"
        case SubscriptionStat.EXPIRED:
            return "פג תוקף"
    }

    return 'הכל'
}

const OrderFeature = Object.freeze({
    CREATE:     1 << 0,
    SHARE:      1 << 1,
    DUPLICATE:  1 << 2,
    SUMMARY:    1 << 3,
    SMS_REMINDER: 1 << 4
});

const WorkerFeature = Object.freeze({
    CREATE:     1 << 0
});

const InvoiceFeature = Object.freeze({
    CREATE:     1 << 0
});

const ReportsFeature = Object.freeze({
    GRAPH_VIEW: 1 << 0
});


const SubscriptionPlanFree = {
    orders: OrderFeature.CREATE,
    workers: WorkerFeature.CREATE,
    invoices: InvoiceFeature.CREATE,
    reports: 0
};

const SubscriptionPlanPremium = {
    orders: OrderFeature.CREATE | OrderFeature.SHARE | OrderFeature.DUPLICATE | OrderFeature.SUMMARY
    | OrderFeature.SMS_REMINDER,
    workers: WorkerFeature.CREATE,
    invoices: InvoiceFeature.CREATE,
    reports: ReportsFeature.GRAPH_VIEW
};

function getPlanSubsFeatures(plan) {
    const result = [];

    for (const module in plan) {
        const permissions = plan[module];

        for (const [bit, text] of Object.entries(FeatureDetails[module])) {
            if (permissions & Number(bit)) {
                result.push({
                    module,
                    text
                });
            }
        }
    }

    return result;
}

const MDTabsView = {
    SUMMARY:1<<0,
    FUNDS:1<<1,
    ACCOUNT:1<<2,
    LOGS:1<<3,
    SETTINGS:1<<4
}




window.SocialMedia = SocialMedia;
window.PageManager = PageManager;
window.StateOrder = StateOrder
