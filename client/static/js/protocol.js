
 const SocialMedia = {
    TIKTOK:1,
    INSTEGRAM:2,
    FACEBOOK:4,
    GOOGLE:8

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
    SOCIAL:1<<0,
    LINKS:1<<1,
    CARDS:1<<2
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
    api:"api"
}

const ApiCall = {
    card_editor:1<<0
}

window.SocialMedia = SocialMedia;
window.PageManager = PageManager;
