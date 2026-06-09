
const c_runtime = {
    items_ordered:{},
    state_client_selected:0,
    state_calendar_selected:0,
    workers:[],
    blockPublishClient:false,
    blockRenderReceiptImg:false,
    orders:[],
    showClientsFrom:new Date().getFullYear()-1,
    invoices:[],
    clients:[],
    isInvoiceSelectMode: false,
    currentClientIdView:null,
    currentOrderIdView:null,
    currentInvoiceIdView:null,
}

function get_client_by_order_id(order_id){
    const order = c_runtime.orders.find(o => o.order_id == order_id)
    if (!order){return}
    const client =  c_runtime.clients.find(c => order.client_id == c.client_id)
    return client
}
function get_order_by_receipt_id(receipt_id){
    const receipt = c_runtime.invoices.find(r => r.receipt_id == receipt_id)
    if (!receipt){
        return null
    }
    const order = c_runtime.orders.find(o => o.order_id == receipt.order_id)
    return order
}


function get_total_price_by_order_id(order_id){
    const order = c_runtime.orders.find(o => o.order_id == order_id)
    if (!order){
        return 0
    }

    let total = 0;
    for (const [k, item] of Object.entries(order.items)){
        total += parseInt(item.price);
    }
    return total-order.off_price
}

function set_current_receipt_id_default(){
    const receipt = c_runtime.invoices.find(r => r.order_id == c_runtime.currentOrderIdView)
    c_runtime.currentInvoiceIdView = receipt?.receipt_id
}

function get_order_by_order_id(oid){
    return c_runtime.orders.find(o => o.order_id == oid)
}

function get_receipt_by_order_id(oid){
    return c_runtime.invoices.find(r => r.order_id == oid && !r.is_credit)
}

function doLogin(t){
    onApiCall(t)
    const username = document.getElementById('username');
    const password = document.getElementById("password");
    if (!username.value || !password.value){
        showToast(message.Elogin||"משהו השתבש", ToastStat.ERROR);
        onApiCall(t, true)
        return;
    }
    const data = {username:username.value, password:password.value}
    const toast = showToast("נכנס..", ToastStat.LOAD)

    apiPost(ApiRoute.auth, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast)
            }
            if (res.code == CODES.registerNotFinished){
                setTimeout(()=>location.href = PageRoute.createAccount, 1600);
                return
            }
            onApiCall(t, true)
            location.href = '/dashboard'
        }
    )
}
function doLogout(){
    const toast = showToast(message.Ilogout)
    setTimeout(() => apiPost(ApiRoute.logout).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR);
                return
            }
            location.reload()
        }
    ), 1000)
}

function switchPageManager(page){
    closeMenuTabsDashboard()
    var last_page = ManagerCache.managerPage();
    if (last_page == -1){
        last_page = PageManager.CLIENTS
        CONFIG.CURRENT_PAGE = last_page;
    }

    const lp = document.getElementById(getPageManager(last_page));
    if (lp) lp.classList.remove("show");

    const _page_ = document.getElementById(getPageManager(page));
    if (!_page_)return
    _page_.classList.add("show")
    ManagerCache.setManagerPage(page)
    CONFIG.CURRENT_PAGE = page;
}



function createCard(card_id=null){
    const mainEdit = document.getElementById("card-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');
    const toast = showToast("מעבד...")
    const data = {action:ApiCall.card_editor, ci:card_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast)
                return
            }

            const editBody = document.getElementById('card-template')
            editBody.innerHTML = res.template;
            showToast(res.notice, ToastStat.DONE, toast);
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
        const a = src.split(".")
        const eof = a[a.length-1]
        file = new File([blob], card_id+"."+eof, { type: blob.type });
        filename = file.name;
    }
    else{
        filename = card_id+"."+file.name.split(".")[file.name.split(".").length-1]
    }

    const whatsapp = document.getElementById("whatsapp-text").value
    let off_price = parseInt(document.getElementById("off-price").value)
    if (!off_price){
        off_price = 0
    }
    const data = {
        action:state_card,
        ci:card_id,
        ct:card_title,
        wt:whatsapp,
        o:1?off_price!=0:0,
        op:off_price,
        imp:filename
    }
    uploadImage(file, filename, ApiUploadFile.CARD);
    const toast = showToast("מעבד..")
    apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
            }
            closeCreateCard(true)
            showToast(res.notice, ToastStat.DONE, toast);
        }
    )

}


function draftCard(){
    publishCard(ApiCall.card_draft)
}

async function deleteCard(card_id){
    const ok = await showAsk({msg:message.WdeleteCard})
    if (!ok)return;
    
    const data = {ci:card_id, action:ApiCall.card_delete}
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



function uploadImage(file, name, action) {
    if (!file)return;
    const reader = new FileReader();
    switch (action){
        case ApiUploadFile.CARD:
        case ApiUploadFile.LOGO:
            reader.onload = function () {
                const base64Data = reader.result.split(",")[1]; // remove prefix
                apiPost(ApiRoute.upImage, {
                    filename:name,
                    action:action,
                    data: base64Data
                }).then(res => {
                    if (!res.success)return
                    if (action == ApiUploadFile.LOGO){
                            const setView = document.getElementById("logoView")
                            const previewUrl = URL.createObjectURL(file);
                            setView.src = previewUrl;
                            setView.onload = () => {
                                URL.revokeObjectURL(previewUrl);
                            };
                        location.reload();
                    }

                });
            };
            reader.readAsDataURL(file);
            break;
    }
}



function openMenuTabsDashboard(t){
    showMenuGeneralItems(t)
    const iconMenuO = document.getElementById("mtdasboard-open");
    const iconMenuC = document.getElementById("mtdasboard-close");
    iconMenuO.style.display = 'none';
    iconMenuC.style.display = 'inline-flex';
}

function closeMenuTabsDashboard(){
    
    const iconMenuO = document.getElementById("mtdasboard-open");
    const iconMenuC = document.getElementById("mtdasboard-close");
    iconMenuO.style.display = 'inline-flex';
    iconMenuC.style.display = 'none';
    const menu = document.getElementById("generalMenu")
    menu.classList.remove("show")
    const mMaster = document.getElementById("menuMaster")
    mMaster.classList.remove("open")
}


// { text: "מודעות", action: (p) => switchPageManager(PageManager.CARDS), icon:'<i class="fa-solid fa-newspaper"></i>'}
const GeneralMenuitems = [
    { text: "עובדים", action: (p) => switchPageManager(PageManager.WORKERS), icon:'<i class="fa-solid fa-users"></i>'},
    { text: "קבלות", action: (p) => switchPageManager(PageManager.INVOICES), icon:'<i class="fa-solid fa-file-invoice"></i>'},
    { text: "יציאה", action: (p) => doLogout(), icon:'<i class="fa-solid fa-person-walking-arrow-right"></i>'},

]
function showMenuGeneralItems(t){
    const menu = document.getElementById("generalMenu")
    const mMaster = document.getElementById("menuMaster")

    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    menu.innerHTML = "";

    GeneralMenuitems.forEach(item => {
        let cma = document.createElement("div")
        cma.className = "master-menu-item"
        let cma1 = document.createElement('div')
        cma1.className = "cma1"
        cma1.innerHTML = item.icon
        
        let cma2 = document.createElement("div")
        cma2.className = 'cma2'
        cma2.textContent = item.text
        cma.appendChild(cma1)
        cma.appendChild(cma2)

        cma.onclick = () => {
            item.action(item.text)
            menu.classList.remove("show")
        }
        menu.appendChild(cma)
    })

    // ברירת מחדל – למטה

    menu.classList.add("show")
    mMaster.classList.add('open')
}




setTimeout(()=>{switchPageManager(ManagerCache.managerPage());},500)