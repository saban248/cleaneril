const CONFIG = {
    CARD_EDIT:false,
    CLIENT_EDIT:false,
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
const StateClient = {
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
        case s&StateClient.WAIT:
            return "לא נסגר"
        case s&StateClient.CLOSED:
            return "בהמתנה"
        case s&StateClient.CANCELED:
            return "בוטל"
        case s&StateClient.DONE:
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
    CALENDAR:1<<7
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
    client_editor:1<<4,
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
    calendar:1<<16
}


const ApiUploadFile = {
    CARD:1<<0,
    LOGO:1<<1
}


window.SocialMedia = SocialMedia;
window.PageManager = PageManager;
window.StateClient = StateClient
