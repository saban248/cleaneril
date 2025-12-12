
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



function createCard(card_id=null){
    const mainEdit = document.getElementById("card-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');

    data = {action:ApiCall.card_editor, card_id:card_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
            }
            const editBody = document.getElementById('card-template')
            console.log(res)
            editBody.innerHTML = res.template;
        }
    )

}

function closeCreateCard(){
    const mainEdit = document.getElementById("card-editor")
    mainEdit.classList.remove("show")
    mainEdit.classList.add("hide")
}


function publishCard(){
    const card_id   = document.getElementById("the-card").dataset.ci
    const card_title = document.getElementById("card-title")
    const fileInput = document.getElementById("imgInput");
    const file = fileInput.files[0];
    const whatsapp = document.getElementById("whatsapp-text")
    const off_price = document.getElementById("off-price")
    data = {
        ci:card_id,
        ct:card_title.value,
        wt:whatsapp.value,
        o:1?off_price!=0:0,
        op:parseInt(off_price.value)
    }

}


function draftCard(){
    
}


function triggerFileSelect() {
    document.getElementById("imgInput").click();
}

function setImage(input, imgTagId) {
    const file = input.files[0];
    if (!file) return;

    const img = document.getElementById(imgTagId);
    img.src = URL.createObjectURL(file);
}