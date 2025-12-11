
/** ON LOAD */


function doLogin(){
    username = document.getElementById('username');
    password = document.getElementById("password");
    if (!username.value || !password.value){
        openPopup("error", "type user or password");
    }
    data = {username:username.value, password:password.value}
    apiPost(ApiRoute.auth, data).then(
        (res) =>{
            if (!res.success){
                openPopup(res.title, res.notice)
            }
            location.href = '/dashboard'
        }
    )
}



function openMenuGeneral(){

}

function switchPageManager(page){
    const last_page = ManagerCache.managerPage();
    if (last_page!=-1){
        const lp = document.getElementById(getPageManager(last_page));
        lp.classList.remove("show")
    }
    var _page_ = null;
    switch (page) {
        case PageManager.SOCIAL:
        case PageManager.LINKS:
        case PageManager.CARDS:
            _page_ = document.getElementById(getPageManager(page));
            
    
        default:
            break;
    }
    if (!_page_)return
    _page_.classList.add("show")
    ManagerCache.setManagerPage(page)
}

