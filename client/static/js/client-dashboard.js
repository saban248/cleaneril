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

async function askAboutExitEditOrder(){
    if (!c_clients.order_edit)return false

    const answer = await showAsk({msg:message.IunsaveOrder});
    if (answer){
            c_clients.order_edit = c_clients.new_order = false;
         
    }
    return answer

}

async function closeClientDashboard(){
    if (c_clients.new_order){
        deleteOrder(c_runtime.currentOrderIdView)
        
    }
    if (isCantExitEditOrder()){
        const a = await askAboutExitEditOrder()
        if (!a){ 
            return
        }

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

async function openClientDashbaord(client_id = c_runtime.currentClientIdView, order_id = c_runtime.currentOrderIdView, fetch = true){
    if (!client_id){
        client_id = get_client_by_order_id(order_id)?.client_id
    }
    c_runtime.currentClientIdView = client_id;
    c_runtime.currentOrderIdView = order_id;
    showClientDashboard()
    await fetchClientDashboard(client_id)
    c_clients.enterCard = true;
    switchViewClientDashboard(clientCardsView.ORDER, fetch)
}


async function fetchClientDashboard(client_id = c_runtime.currentClientIdView){
    const toast = showToast("מעבד...");
    data = {action:ApiCall.client_view, cid:client_id}
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

async function fetchClientOrder(order_id = c_runtime.currentOrderIdView, api_action = ApiCall.order_view){
    if (!order_id && !c_clients.new_order){return}
    const toast = showToast("מעבד...");
    data = {action:api_action, oi:order_id}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                return
            }
            closeToast(toast)
            const card = document.getElementById("the-client-card")
            card.innerHTML = res.template;
            c_runtime.currentClientIdView = card.dataset.ci 
            c_runtime.currentOrderIdView = res.order_id;
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
    const currentOrder = c_runtime.orders.find(c=> c.order_id == c_runtime.currentOrderIdView);
    const icon = document.getElementById('iel-orders');
    if (!c_runtime.orders || !currentOrder){
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
    for (let order of c_runtime.orders){
        if (order.client_id != c_runtime.currentClientIdView){
            continue;
        }

        const element = createOrderItem(order.client_id, order, false, async ()=>{
            await showClientOrder(order.order_id)
            createListClientOrders()
        });
        if (order.order_id == c_runtime.currentOrderIdView){
            element.classList.add('current-client-list');
        }
        parent.appendChild(element);
    }
    
}


async function fetchClientOrderInvoice(iid){
    if (!iid){
        showToast(message.EselectReceipt);
        return
    }
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
    if (iid == undefined || c_runtime.blockRenderReceiptImg)return
    c_runtime.blockRenderReceiptImg = true;
    await fetchClientOrderInvoice(iid)
    const template = document.getElementById("receiptTemplate");
    const img = document.getElementById("imgReceipt");
    const icon = document.getElementById("before-load-receipt");
    icon.style.display = 'none'
    template.style.display = 'block'
    await createImgInvoice(template, img)
    img.style.display = 'block'
    template.style.display = 'none'
    c_runtime.blockRenderReceiptImg = false;
}
function removeOrderReceiptImg(){
    const img = document.getElementById("imgReceipt");
    const icon = document.getElementById("before-load-receipt");
    icon.style.display = 'block'
    img.style.display = 'none'
    img.src =''

}


function switchClientCardAction(){
    const run = (element, display) => element.classList.add(display)
    const show = (element) => element.classList.add('show')||element.classList.remove('hide')
    const hide = (element) => element.classList.remove('show')||element.classList.add('hide')

    const AView = document.getElementById("clientCardAViews");
    const ainto = document.getElementById("actionIntoCard");
    // return from card
    const arfc = document.getElementById("arfc")
    const SpecificId = (c_clients.currentCard == clientCardsView.ORDER && c_runtime.currentOrderIdView !=null)
            || (c_clients.currentCard == clientCardsView.RECEIPT && c_runtime.currentInvoiceIdView !=null)

    if (c_clients.enterCard && IS_MOBILE && !c_clients.new_order){
        if (SpecificId){
            show(ainto)
        }else{
            hide(ainto)
        }
        show(arfc)
        hide(AView)
    }
    else if (!IS_MOBILE){
        if (SpecificId){
            show(ainto)
        }else{
            hide(ainto)
        }      
        show(AView)
        hide(arfc)
    }
    else{
        hide(ainto)
        show(AView)
        hide(arfc)
    }
}
async function switchViewClientDashboard(v = c_clients.currentCard, fetch = true, back = false){
    // BACK DELETED
    if (isCantExitEditOrder()){
        if (await !askAboutExitEditOrder()){return}
    }
    if (c_clients.currentOrderIdView && c_clients.new_order){
        showToast("סיים יצירת הזמנה חדשה לפני", ToastStat.ERROR)
        return
    }

    if (!v){v = c_clients.currentCard}
    switch (v){
        case clientCardsView.ORDER:
            if (!c_clients.new_order){
                showClientOrders()
            }
            if (!back && c_clients.enterCard){
                showClientOrder(c_runtime.currentOrderIdView, fetch)
            }
            hideClientReceipts()
            hideClientReceipt()
            break
        case clientCardsView.RECEIPT:
            showClientReceipts()
            if (!back && c_clients.enterCard){
                showClientReceipt(c_runtime.currentInvoiceIdView, fetch)
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
    const currentClient = c_runtime.orders.find(c=> c.client_id == c_runtime.currentClientIdView);
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
    for (let receipt of c_runtime.invoices.filter(r => r.client_id == c_runtime.currentClientIdView)){
        const element = createInvoiceItem(receipt,false, async ()=>{
            await showClientReceipt(receipt.receipt_id)
            createListClientReceipts()
        }
        )
        if (!element){continue}
        if (receipt.receipt_id == c_runtime.currentInvoiceIdView){
            element.classList.add('current-client-list');
        }
        parent.appendChild(element);
    }   
}



async function showClientOrder(oid = c_runtime.currentOrderIdView, fetch = true){
    if (isCantExitEditOrder()){
        if (await !askAboutExitEditOrder()){return}

    }
    if (fetch){
        await fetchClientOrder(oid)
    }
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
        showToast(message.EneedRefresh, ToastStat.ERROR)
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

async function showClientReceipt(iid = c_runtime.currentInvoiceIdView, fetch = true){
    if (fetch){
        await createClientOrderInvoiceImg(iid)
    }
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
    if (!c_runtime.currentInvoiceIdView){
        set_current_receipt_id_default()
    }
    createListClientReceipts();
}

function hideClientReceipts(){
    const parent = document.getElementById("the-client-receipts");
    parent?.classList.remove("show")

}

/** ACTIONS */

async function editExistOrder(order_id = c_runtime.currentOrderIdView){
    if (!c_clients.client_view){
            if (!c_runtime.currentClientIdView){
                const client = get_client_by_order_id(order_id)
                c_runtime.currentClientIdView = client.client_id;
                
            }
        await openClientDashbaord(c_runtime.currentClientIdView, order_id, false)
    }
    c_clients.order_edit = true; 
    c_runtime.currentClientIdView = order_id;
    if (!order_id)return
    await fetchClientOrder(order_id, ApiCall.order_edit)
}

async function shareOrderToClientAsPhoto(cid = c_runtime.currentClientIdView){
    if (isCantExitEditOrder()){
        if (await !askAboutExitEditOrder()){return}

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

async function deleteOrder(order_id = c_runtime.currentOrderIdView, callback){
    const ok = await showAsk({msg:message.WdeleteOrder})
    if (!ok){return}
    if (!order_id){
        showToast("בחר הזמנה כדי למחוק", ToastStat.ERROR)
        return
    }
    data = {oi:order_id, action:ApiCall.order_delete}
    return await new Promise((reslove) => apiPost(ApiRoute.api,data).then(
        async (res) =>{
            if (!res.success || res.deleted){
                showToast(res.notice, ToastStat.DONE);
                return
            }
            await fetchOrders()
            createListClientOrders()
            callback?callback():null
            c_runtime.currentOrderIdView = null
            reslove()
        }
    ))
}

async function createOrder(){
    c_clients.new_order = true;
    await openClientDashbaord(c_runtime.currentClientIdView, null, false)
    await fetchClientOrder(null, ApiCall.order_new)
    showClientOrder(c_runtime.currentOrderIdView, false)
    

}


function searchClientNewOrder(e){
    if (e.inputType === "deleteContentBackward"){
        return
    }
    const name = document.getElementById("fullname");
    const address = document.getElementById("client-location")
    const phone = document.getElementById("client-phone");
    // const parent = document.getElementById("items-ordered");
    
    const value = name.value.toLowerCase();
    if (value == '')return
    const match = c_runtime.orders.find(o => o.fullname.toLowerCase().startsWith(value));
    if (!match){return}
    name.value  = match.fullname
    address.value = match.address;
    phone.value = match.phone;
    
    requestAnimationFrame(() => {
        name.focus();
        name.setSelectionRange(value.length, match.fullname.length);
    });
    // for (let [k,v] of Object.entries(match.items)){
    //     addItemClientOrder(v.name,v.price)
    // }

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
    c_runtime.items_ordered[div.id] = {name:name||'unknown',price:price||0}
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

async function deleteReceiptFromDashbaord(receipt_id = c_runtime.currentInvoiceIdView){
    const success = () =>{
        switchViewClientDashboard(c_clients.currentCard,false, true)
        createListClientReceipts()
        removeOrderReceiptImg();
    }
    await deleteReceipt(receipt_id, success)
}

async function deleteOrderFromDashhbaord(order_id = c_runtime.currentOrderIdView) {
    const success = ()=>{
        switchClientCardAction(c_clients.currentCard, false, true)
        createListClientOrders()
    }
    await deleteOrder(order_id, success)
}



async function setStateCleanOrder(order_id = c_runtime.currentOrderIdView, state){
    data = {action: ApiCall.client_state, oi:order_id, s:state}
    const client = get_client_by_order_id(order_id)
    const toast = showToast("מעבד...");
    return await new Promise ((resolve) => apiPost(ApiRoute.api, data).then(
        async (res) =>{
            if (!res.success){
                showToast(res.notice)
                return
            }
            await fetchOrders();
            
            showToast(`${client.fullname} ${getStateClientText(state)}`, ToastStat.DONE, toast);
            
        }
    ))

}


