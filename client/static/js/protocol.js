const CONFIG = {
    CARD_EDIT:false,
    CLIENT_VIEW:false,
    WORKER_EDIT:false,
    WORKER_VIEW:false,
    CURRENT_PAGE:-1,
    IMG_ORDER:0
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
    switch (s){
        case s&StateOrder.WAIT:
            return "לא נסגר"
        case s&StateOrder.CLOSED:
            return "בהמתנה"
        case s&StateOrder.CANCELED:
            return "בוטל"
        case s&StateOrder.DONE:
            return "הושלם!"
    }
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
    INVOICES:1<<8
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

const ApiRoute = {
    auth:"do_auth",
    api:"api",
    upImage:"up_image",
    register: "register"
}
const RegisterApi = {
    level1:1<<0,
    level2:1<<1,
    level3:1<<3,
    level4:1<<4
}


const ApiCall = {
    card_editor :1<<0,
    card_draft:1<<1,
    card_delete:1<<2,
    card_save:1<<3,
    order_edit:1<<4,
    client_delete:1<<5,
    client_save:1<<6,
    client_view:1<<7,
    client_state:1<<8,
    funds_income:1<<9,
    conf_company:1<<10,
    client_workers:1<<11,
    worker_editor:1<<12,
    worker_view:1<<13,
    worker_save:1<<14,
    worker_delete:1<<15,
    calendar:1<<16,
    client_list:1<<17,
    invoice_view:1<<18,
    invoice_create:1<<19,
    invoice_list:1<<20,
    view_order:1<<21
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


const clientCardsView = {
    ORDER:1<<0,
    RECEIPT:1<<1
}

window.SocialMedia = SocialMedia;
window.PageManager = PageManager;
window.StateOrder = StateOrder
