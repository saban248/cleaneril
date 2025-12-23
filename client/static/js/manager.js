
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
    var last_page = ManagerCache.managerPage();
    if (last_page == -1){
        last_page = PageManager.CARDS
        CONFIG.CURRENT_PAGE = last_page;
    }

    const lp = document.getElementById(getPageManager(last_page));
    console.log(lp)
    lp.classList.remove("show")
    var _page_ = null;
    switch (page) {
        case PageManager.GIFTS:
        case PageManager.LINKS:
        case PageManager.CARDS:
        case PageManager.CLIENTS:
            _page_ = document.getElementById(getPageManager(page));
            
    
        default:
            break;
    }
    if (!_page_)return
    _page_.classList.add("show")
    ManagerCache.setManagerPage(page)
    CONFIG.CURRENT_PAGE = page;
}



function createCard(card_id=null){
    const mainEdit = document.getElementById("card-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');

    data = {action:ApiCall.card_editor, ci:card_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('card-template')
            editBody.innerHTML = res.template;
        }
    )

}

function closeCreateCard(no_api=false){
    const mainEdit = document.getElementById("card-editor")
    mainEdit.classList.remove("show")
    mainEdit.classList.add("hide")
    const card_id   = document.getElementById("the-card").dataset.ci;
   ( !no_api && !CONFIG.CARD_EDIT)&& deleteCard(card_id)
   CONFIG.CARD_EDIT =false;
}


async function publishCard(state_card=ApiCall.card_save){
    const card_id   = document.getElementById("the-card").dataset.ci
    const card_title = document.getElementById("card-title").value
    const fileInput = document.getElementById("imgInput");
    let file = fileInput.files[0];
    var filename = null;
    if (!file){
        const src = document.getElementById("previewImg").src;

        // Fetch the image data from the src
        const res = await fetch(src);
        const blob = await res.blob();

        // Create File object from Blob
        a = src.split(".")
        eof = a[a.length-1]
        file = new File([blob], card_id+"."+eof, { type: blob.type });
        filename = file.name;
    }
    else{
        filename = card_id+"."+file.name.split(".")[file.name.split(".").length-1]
    }

    const whatsapp = document.getElementById("whatsapp-text").value
    var off_price = parseInt(document.getElementById("off-price").value)
    if (!off_price){
        off_price = 0
    }
    data = {
        action:state_card,
        ci:card_id,
        ct:card_title,
        wt:whatsapp,
        o:1?off_price!=0:0,
        op:off_price,
        imp:filename
    }
    uploadImage(file, filename);
    apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                openPopup(res.title, res.notice)
            }
            closeCreateCard(true)
        }
    )

}


function draftCard(){
    publishCard(ApiCall.card_draft)
}

function deleteCard(card_id){
    if (!confirm("continue?"))return;
    data = {ci:card_id, action:ApiCall.card_delete}
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(card_id)?.remove();

        }
    )


}

function editExistCard(card_id){
    CONFIG.CARD_EDIT = true;
    createCard(card_id)
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



function uploadImage(file, name) {

    if (!file)return;
    const reader = new FileReader();
    reader.onload = function () {
        const base64Data = reader.result.split(",")[1]; // remove prefix
        apiPost(ApiRoute.upImage, {
            filename:name,
            data: base64Data
        }).then(res => {

        });
    };

    reader.readAsDataURL(file);
}








// setTimeout(function(){switchPageManager(PageManager.CARDS);},500)