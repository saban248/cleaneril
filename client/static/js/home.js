const logo = document.getElementById("logo");
const heroHeight = document.querySelector(".head-home").offsetHeight;

window.addEventListener("scroll", () => {
    let sc = window.scrollY;
    
    // scale from 1 → min 0.6
    let scale = 1 - (sc / (heroHeight * 1.5));

    if (scale < 0.6) scale = 0.6; // minimum size

    logo.style.transform = `scale(${scale})`;
});





function openSocielMedia(social){
    switch (social){
        case SocialMedia.GOOGLE:
            link = 'https://share.google/8fkNArknlSb1hgq4c'
            break;
        case SocialMedia.TIKTOK:
            link = 'https://www.tiktok.com/@cleaneril'
            break;
        case SocialMedia.FACEBOOK:
            link = 'https://www.facebook.com/p/%D7%94%D7%91%D7%A8%D7%A7%D7%94-%D7%91%D7%93%D7%A7%D7%94-%D7%A0%D7%99%D7%A7%D7%95%D7%99-%D7%A8%D7%99%D7%A4%D7%95%D7%93%D7%99%D7%9D-61559552106769/?wtsid=rdr_0qRVWX5f3Fn4Tomu1'
            break;
            case SocialMedia.INSTEGRAM:
            link = 'https://www.instagram.com/cleaneril/'
        default:
            break;
    }
    console.log(link)

    open(link, "_blank")
    
}


