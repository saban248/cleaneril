const c_clients = {
    enterCard:null,
    currentCard:clientCardsView.ORDER,
    order_edit:false,
    new_order:false,
    client_view:false
}

function isCantExitEditOrder(){
    return c_clients.order_edit
}
function askAboutExitEditOrder(){
    if (!c_clients.order_edit)return false

    const answer = confirm(messgae.IunsaveOrder)
    if (answer){
        if (c_clients.new_order){
            deleteOrder(c_runtime.currentClientIdView)
        }
        c_clients.order_edit = c_clients.new_order = false;
    } 
    return answer

}

function closeClientDashboard(no_api=false){
    if (isCantExitEditOrder()){
        if (!askAboutExitEditOrder()){ return}

    }
    hideClientDashboard()
   c_clients.order_edit =  c_clients.new_order =false;
   c_clients.client_view =false;
   c_runtime.currentClientIdView = null;

}

function showClientDashboard(){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.add('show');
}
function hideClientDashboard(){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('show');

}

async function openClientDashbaord(client_id = c_runtime.currentClientIdView){
    showClientDashboard()
    await fetchClientDashboard(client_id)
    c_clients.enterCard = true;

    switchViewClientDashboard(clientCardsView.ORDER)
}


async function fetchClientDashboard(client_id = c_runtime.currentClientIdView){
    const toast = showToast("מעבד...");
    data = {action:ApiCall.client_view, ci:client_id}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                c_clients.client_view = false;
                return
            }
            c_clients.client_view = true;
            closeToast(toast)
            const editBody = document.getElementById('client-template-dashboard')
            editBody.innerHTML = res.template;
            c_runtime.currentClientIdView = client_id;
            reslove();
        }
    ))

}

async function fetchClientOrder(client_id = c_runtime.currentClientIdView, api_action = ApiCall.view_order){
    if (!client_id && !c_clients.new_order)return
    const toast = showToast("מעבד...");
    data = {action:api_action, ci:client_id}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                return
            }
            closeToast(toast)
            const card = document.getElementById("the-client-card")
            card.innerHTML = res.template;
            c_runtime.currentClientIdView = card.dataset.ci = res.client_id
            c_clients.currentCard = clientCardsView.ORDER
            c_clients.enterCard = true;
            if (c_clients.order_edit || c_clients.new_order){
                onLoadEditClient()
            }
            reslove();
        }
    ))
}
function createListClientOrders(){
    const deleteChildren = ()=>{
        [...parent.children].forEach(child => {
            if (child.id !== "iel-orders") {
                child.remove();
            }
        });
    }
    const parent = document.getElementById("listClientOrders");
    const currentClient = c_runtime.clients.find(c=> c.client_id == c_runtime.currentClientIdView);
    const icon = document.getElementById('iel-orders');
    if (!c_runtime.clients || !currentClient){
        if (!icon)return
        icon.style.display = 'block'
        parent.classList.add("icon-empty-list")
        deleteChildren()
        return
    }
    else{
        parent.classList.remove("icon-empty-list")
        icon.style.display = 'none';
    }
    deleteChildren()
    for (let client of c_runtime.clients){
        const name = matchNumsWords(1, client.fullname, currentClient.fullname);
        const phone = cleanPhoneJustNumbers(client.phone) == cleanPhoneJustNumbers(currentClient.phone);
        const address = matchNumsWords(2,client.address, currentClient.address);
        if (!(name && phone && address))continue;

        const element = createClientItem(client, false, async ()=>{
            await showClientOrder(client.client_id)
            createListClientOrders()
        });
        if (client.client_id == c_runtime.currentClientIdView){
            element.classList.add('current-client-list');
        }
        parent.appendChild(element);
    }
    
}


async function fetchClientOrderInvoice(iid){
    const toast = showToast("מעבד...");
    data = {action:ApiCall.invoice_view, iid:iid}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                return
            }
            c_runtime.currentInvoiceIdView = iid
            c_clients.currentCard = clientCardsView.RECEIPT
            const template = document.getElementById("receiptTemplate");
            template.innerHTML = res.template;
            showToast(res.notice, ToastStat.DONE, toast)
            c_clients.enterCard = true;
            reslove();
        }
    ))
}

async function createClientOrderInvoiceImg(iid){
    if (iid == undefined)return
    await fetchClientOrderInvoice(iid)
    const template = document.getElementById("receiptTemplate");
    const img = document.getElementById("imgReceipt");
    const icon = document.getElementById("before-load-receipt");
    icon.style.display = 'none'
    template.style.display = 'block'
    await createImgInvoice(template, img)
    img.style.display = 'block'
    template.style.display = 'none'
}


function switchClientCardAction(){
    const AView = document.getElementById("clientCardAViews");
    const AReturn = document.getElementById("actionIntoCard");
    // return from card
    const arfc = document.getElementById("arfc")
    if (c_clients.enterCard && IS_MOBILE && !c_clients.new_order){
        AView.classList.remove("show")
        AReturn.classList.add("show")
        arfc.classList.add("show")
    }
    else if (!IS_MOBILE){
        AReturn.classList.add("show")
        AView.classList.add("show")
        arfc.classList.remove("show")
    }
    else{
        AReturn.classList.remove("show")
        AView.classList.add("show")
        arfc.classList.remove("show")
    }
}
function switchViewClientDashboard(v = c_clients.currentCard, back = false){
    if (isCantExitEditOrder()){
        if (!askAboutExitEditOrder()){return}
    }

    if (!v){v = c_clients.currentCard}
    switch (v){
        case clientCardsView.ORDER:
            if (!c_clients.new_order){
                showClientOrders()
            }
            if (!back && c_clients.enterCard){
                showClientOrder()
            }
            hideClientReceipts()
            hideClientReceipt()
            break
        case clientCardsView.RECEIPT:
            showClientReceipts()
            if (!back && c_clients.enterCard){
                showClientReceipt()
            }
            hideClientOrder()
            hideClientOrders()
            break       
    }
    c_clients.currentCard = v
    if (back){c_clients.enterCard = false;}
    switchClientCardAction()
    switchMenuActionClientCard()
}

function switchMenuActionClientCard(){
    // actions: share order photo
    const asop = document.getElementById("asop")
    // edit exist order
    const aeeo = document.getElementById("aeeo")
    // create order invoice/receipt
    const acoi = document.getElementById("acoi")
    // sahre receipt photo
    const asrp = document.getElementById("asrp")
    // edit receipt order
    const aero = document.getElementById("aero");
    // duplicate client order
    const adco = document.getElementById("adco")
    // delete order client
    const adoc = document.getElementById("adoc")
    // delete receipt order
    const adro = document.getElementById("adro")
    const s = (element) => element.classList.remove("hide")||element.classList.add("show")
    const h = (element) => element.classList.remove("show")||element.classList.add("hide")
    if (c_clients.new_order){
        h(asop);h(aeeo);h(acoi);h(asrp);h(aero);h(adoc);h(adro);h(adco)
        return
    }
    switch (c_clients.currentCard){
        case clientCardsView.ORDER:
            s(asop)
            s(aeeo)
            s(acoi)
            s(adoc)
            s(adco)
            h(asrp)
            h(aero)
            h(adro)
            break
        case clientCardsView.RECEIPT:
            h(acoi)
            h(asop)
            h(aeeo)
            h(adoc)
            h(adco)
            s(asrp)
            s(aero)
            s(adro)
            break
    }
}

 
function createListClientReceipts(){
    const parent = document.getElementById("listClientReceipts");
    const currentClient = c_runtime.clients.find(c=> c.client_id == c_runtime.currentClientIdView);
    if (!c_runtime.invoices || !currentClient){
        const icon = document.getElementById('iel-receipts');
        icon.style.display = 'block'
        parent.classList.add("icon-empty-list")
        return
    }
    else{
        parent.classList.remove("icon-empty-list")
    }

    parent.replaceChildren();
    for (let invoice of c_runtime.invoices){
        const name = matchNumsWords(1, invoice.order.fullname, currentClient.fullname);
        const phone = cleanPhoneJustNumbers(invoice.order.phone) == cleanPhoneJustNumbers(currentClient.phone);
        const address = matchNumsWords(2,invoice.order.address, currentClient.address);
        if (!(name && phone && address))continue;
        const element = createInvoiceItem(invoice,false, async ()=>{
            await showClientReceipt(invoice.invoice_id)
            createListClientReceipts()
        }
        )
        if (invoice.invoice_id == c_runtime.currentInvoiceIdView){
            element.classList.add('current-client-list');
        }
        parent.appendChild(element);
    }   
}



async function showClientOrder(cid = c_runtime.currentClientIdView){
    if (isCantExitEditOrder()){
        if (!askAboutExitEditOrder()){return}

    }
    await fetchClientOrder(cid, (c_clients.new_order||c_clients.order_edit)?ApiCall.order_edit:ApiCall.view_order)
    const card = document.getElementById("the-client-card")
    card.classList.add("show")
    if (IS_MOBILE){
        hideClientOrders()
    }
    c_clients.enterCard = true;
    switchClientCardAction()
}


function hideClientOrder(){
    const card = document.getElementById("the-client-card")
    card.classList.remove("show")

}

function showClientOrders(){
    const parent = document.getElementById("the-client-orders")
    if (!parent){
        showToast(messgae.EneedRefresh, ToastStat.ERROR)
        return;
    }
    if (IS_MOBILE){
        hideClientOrder()
    }
    switchClientCardAction()
    if (parent.classList.contains("show")){
        return;
    }
    parent.classList.add("show")
    createListClientOrders();

}
function hideClientOrders(){
    const parent = document.getElementById("the-client-orders")
    parent.classList.remove("show")

}

async function showClientReceipt(iid){
    await createClientOrderInvoiceImg(iid)
    const invoice = document.getElementById("the-client-invoice");
    invoice.classList.add("show")
    if (IS_MOBILE){
        hideClientReceipts()
    }
    c_clients.enterCard = true;
    switchClientCardAction()
}
function hideClientReceipt(){
    const invoice = document.getElementById("the-client-invoice");
    invoice.classList.remove("show")
}
function showClientReceipts(){
    const parent = document.getElementById("the-client-receipts");
    if (IS_MOBILE){
        hideClientReceipt()
    }
    switchClientCardAction()
    if (parent.classList.contains("show")){
        return;
    }
    parent.classList.add("show")
    createListClientReceipts();
}

function hideClientReceipts(){
    const parent = document.getElementById("the-client-receipts");
    parent?.classList.remove("show")

}

/** ACTIONS */

async function editExistOrder(client_id = c_runtime.currentClientIdView){
    if (!c_clients.client_view){
        showClientDashboard()
    }
    c_clients.order_edit = true; 
    c_runtime.currentClientIdView = client_id;
    if (!client_id)return
    fetchClientOrder(client_id, ApiCall.order_edit)
}

async function shareOrderToClientAsPhoto(cid = c_runtime.currentClientIdView){
    if (isCantExitEditOrder()){
        if (!askAboutExitEditOrder()){return}

    }
    await showClientOrder(cid)
    await prepareOrderImage()
    const file = new File([CONFIG.IMG_ORDER], "order.png", { type: "image/png" });

    if (navigator.share) {
        await navigator.share({
            title: "הזמנה",
            text: "הזמנה חדשה",
            files: [file]
        });
    }
}

function shareReceiptToClientAsPhoto(iid = c_runtime.currentInvoiceIdView){

}

function deleteOrder(client_id = c_runtime.currentClientIdView){
    if (!confirm(messgae.WdeleteOrder)){return}
    if (!client_id){
        showToast("בחר הזמנה כדי למחוק", ToastStat.ERROR)
        return
    }
    data = {ci:client_id, action:ApiCall.client_delete}
    apiPost(ApiRoute.api,data).then(
        async (res) =>{
            if (!res.success || res.deleted){
                showToast(res.success, ToastStat.DONE);
                return
            }
                await fetchClients()
                createListClientOrders()

        }
    )
}

async function createOrder(){
    c_clients.new_order = true;
    await openClientDashbaord()
    c_clients.order_edit = true;

}


function searchClientNewOrder(e){
    if (e.inputType === "deleteContentBackward"){
        return
    }
    const name = document.getElementById("fullname");
    const address = document.getElementById("client-location")
    const phone = document.getElementById("client-phone");
    const parent = document.getElementById("items-ordered");
    
    const value = name.value.toLowerCase();
    if (value == '')return
    const match = c_runtime.clients.find(c => c.fullname.toLowerCase().startsWith(value));
    if (!match){return}
    name.value  = match.fullname
    address.value = match.address;
    phone.value = match.phone;
    
    requestAnimationFrame(() => {
        name.focus();
        name.setSelectionRange(value.length, match.fullname.length);
    });
    parent.replaceChildren()
    for (let [k,v] of Object.entries(JSON.parse(match.items))){
        addItemClientOrder(v.name,v.price)
    }

}

function editOrdersClient(){
    const parent = document.getElementById("items-ordered");

    const children = parent.children
    const length = children.length;
    const temp = []
    for (let index=0;index<length;index++){
        const name = children[index].children[0].textContent
        const price = children[index].children[1].textContent
        temp.push([name, price.replace(/[^\d]/g, "")])
    }
    parent.replaceChildren()
    for (edit of temp){
        addItemClientOrder(edit[0], edit[1]);
    }

}

function addItemClientOrder(name, price) {
    const items = document.getElementById("items-ordered");

    const div = document.createElement("div");
    div.className = "ordered";
    div.id = items.childElementCount;
    const inputName = document.createElement("input");
    inputName.classList.add('c-input-item-name')
    inputName.id = `${div.id}-name`
    if (name){
        inputName.value = name;
    }


    const inputPrice = document.createElement("input");
    inputPrice.oninput = (e)=>{mainSyncTotalPrice(e.target)}
    inputPrice.classList.add('c-input-fn')
    inputPrice.type = 'tel'
    inputPrice.id = `${div.id}-price`
    if (price){
        inputPrice.value = price;
    }

    const trash = document.createElement('i')
    trash.classList = "fa-solid fa-trash-can trash-order"
    trash.onclick = ()=>{deleteItemClientOrder(div.id)}

    div.append(inputName, inputPrice, trash);
    items.appendChild(div);
    c_runtime.items_ordered[div.id] = {name:name,price:price}
}

function deleteItemClientOrder(id_order){
    const parent = document.getElementById(id_order)
    if (!parent)return
    const element = document.getElementById(id_order+"-price")
    element.value = -parseInt(element.innerText)
    mainSyncTotalPrice(element)
    delete c_runtime.items_ordered[id_order]
    parent.remove()
}




