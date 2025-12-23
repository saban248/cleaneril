const CONFIG = {
    CARD_EDIT:false,
    CLIENT_EDIT:false,
    CURRENT_PAGE:-1
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
    CLIENTS:1<<3
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


const ApiRoute = {
    auth:"do_auth",
    api:"api",
    upImage:"up_image"
}

const ApiCall = {
    card_editor :1<<0,
    card_draft:1<<1,
    card_delete:1<<2,
    card_save:1<<3,
    client_editor:1<<4,
    client_delete:1<<5,
    client_save:1<<6,
    client_view:1<<7
}

window.SocialMedia = SocialMedia;
window.PageManager = PageManager;
