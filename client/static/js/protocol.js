

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


window.SocialMedia = SocialMedia;