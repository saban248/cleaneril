const c_clients = {
    enterCard:null,
    currentCard:clientCardsView.ORDER,
    order_edit:false,
    new_order:false,
    client_view:false,
    receipt_edit:false,
    cot_selected:CleanOrderType.UPHOLSTERY
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
        const deleted = await deleteOrder(c_runtime.currentOrderIdView)
        if (!deleted)return
        c_clients.new_order = false;
        
    }
    else if (isCantExitEditOrder()){
        const a = await askAboutExitEditOrder()
        if (!a){ 
            return
        }

    }
    hideClientDashboard()
   c_clients.order_edit =  c_clients.new_order =false;
   c_clients.client_view =false;
   c_runtime.currentClientIdView = null;
   c_runtime.currentInvoiceIdView = null;
   c_runtime.currentOrderIdView = null;

}

function showClientDashboard(){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.add('show');
}
function hideClientDashboard(){
    const orderClientTemate = document.getElementById("client-template-dashboard")
    orderClientTemate.replaceChildren()
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('show');

}

async function openClientDashbaord(client_id = c_runtime.currentClientIdView, order_id = c_runtime.currentOrderIdView, fetch = true, switchView = false){
    if (switchView){
        switchPageManager(PageManager.CLIENTS)
    }
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

async function fetchClientOrder(order_id = c_runtime.currentOrderIdView, api_action = ApiCall.order_view, dany){
    if (!order_id && !c_clients.new_order){return}
    const toast = showToast("מעבד...");
    data = {action:api_action, oi:order_id, ...dany}
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
                onLoadEditClient(res.order_id)
            }
            reslove();
        }
    ))
}
function createListClientOrders(){
    const parent = document.getElementById("listClientOrders");
    const deleteChildren = ()=>{
        [...parent.children].forEach(child => {
            if (child.id !== "iel-orders") {
                child.remove();
            }
        });
    }
    let currentOrder = c_runtime.orders.find(c=> c.order_id == c_runtime.currentOrderIdView);
    if (!currentOrder && c_runtime.currentClientIdView){
        currentOrder = c_runtime.orders.filter( o => o.client_id == c_runtime.currentClientIdView)?.[0]
    }
    const icon = document.getElementById('iel-orders');
    if (!c_runtime.orders||!currentOrder){
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
        if (cleanPhoneJustNumbers(order.phone) != cleanPhoneJustNumbers(currentOrder.phone)){
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

async function createClientOrderInvoiceImg(iid, scale = 2){
    if (iid == undefined || c_runtime.blockRenderReceiptImg)return
    c_runtime.blockRenderReceiptImg = true;
    await fetchClientOrderInvoice(iid)
    const template = document.getElementById("receiptTemplate");
    const img = document.getElementById("imgReceipt");
    const icon = document.getElementById("before-load-receipt");
    icon.style.display = 'none'
    template.style.display = 'block'
    await createImgInvoice(template, img, scale)
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
    const show = (element) => element.classList.add('show')||element.classList.remove('hide')
    const hide = (element) => element.classList.remove('show')||element.classList.add('hide')

    const AView = document.getElementById("clientCardAViews");
    const ainto = document.getElementById("actionIntoCard");
    // return from card
    const arfc = document.getElementById("arfc");
    // close client dashboard
    const accd = document.getElementById("accd");
    const SpecificId = (c_clients.currentCard == clientCardsView.ORDER && c_runtime.currentOrderIdView !=null)
            || (c_clients.currentCard == clientCardsView.RECEIPT && c_runtime.currentInvoiceIdView !=null)

    if (c_clients.enterCard && IS_MOBILE){
        if (SpecificId){
            show(ainto)
        }else{
            hide(ainto)
        }
        show(arfc)
        hide(accd)
        hide(AView)
    }
    else if (!IS_MOBILE){
        if (SpecificId){
            show(ainto)
        }else{
            hide(ainto)
        }      
        show(AView)
        show(accd)
        hide(arfc)
    }
    else{
        hide(ainto)
        show(AView)
        hide(arfc)
        show(accd)
    }
}
async function switchViewClientDashboard(v = c_clients.currentCard, fetch = true, back = false){
    if (isCantExitEditOrder()){
        if (!(await askAboutExitEditOrder())){return}
    }
    if (c_clients.currentOrderIdView && c_clients.new_order){
        showToast("סיים יצירת הזמנה חדשה לפני", ToastStat.ERROR)
        return
    }
    const parentBody = document.getElementById("client-template-dashboard")
    parentBody.scrollTop = 0;

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
            hideClientReports()
            break
        case clientCardsView.RECEIPT:
            showClientReceipts()
            if (!back && c_clients.enterCard){
                showClientReceipt(c_runtime.currentInvoiceIdView, fetch)
            }
            hideClientOrder()
            hideClientOrders()
            hideClientReports()
            break
        case clientCardsView.REPORTS:
            showClientReports()

            hideClientOrder()
            hideClientOrders()
            hideClientReceipt()
            hideClientReceipts()
            break
    }
    const lastBtnView = document.getElementById(`cdv${c_clients.currentCard}`)
    const currentBtnView = document.getElementById(`cdv${v}`)
    lastBtnView.classList.remove("current-cdv")
    currentBtnView.classList.add("current-cdv")
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
    // cancel edit receipt order
    const acero = document.getElementById("acero")
    // publish clean order cancel
    const apcocan = document.getElementById("apcocan")
    // publish clean order 
    const apcow = document.getElementById("apcow")
    // publish clean order closed
    const apcoc = document.getElementById("apcoc")
    // publish clean order done
    const apcod = document.getElementById("apcod");
    // cancel edit order
    const aceo = document.getElementById("aceo")

    const s = (element) => element.classList.remove("hide")||element.classList.add("show")
    const h = (element) => element.classList.remove("show")||element.classList.add("hide")
    const receipt = getReceiptsByOrderId(c_runtime.currentOrderIdView);
    switch (c_clients.currentCard){
        case clientCardsView.ORDER:
            if (c_clients.new_order||c_clients.order_edit){
                h(asop);h(aeeo);h(adoc);h(adco);h(acoi)
                s(apcocan);s(apcow);s(apcoc);s(apcod);s(aceo)
            }else{
                h(apcocan);h(apcow);h(apcoc);h(apcod);h(aceo)
                s(asop);s(aeeo);s(adoc);s(adco);
                if (receipt){h(acoi)}else{s(acoi)}
            }
            h(acero);
            h(asrp);h(aero);h(adro);
            break
        case clientCardsView.RECEIPT:
            h(acoi)
            h(asop)
            h(aeeo)
            h(adoc)
            h(adco)
            if (c_clients.receipt_edit){
                h(aero)
                h(adro)
                h(asrp)
                s(acero)
            }else{
                h(aero)
                s(adro)
                s(asrp)
                h(acero)
            }
            break
    }
}

 
async function createListClientReceipts(){
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
           showClientReceipt(receipt.receipt_id);
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
        if (!(await askAboutExitEditOrder())){return}

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
    const invoice = document.getElementById("the-client-invoice");
    invoice.classList.add("show")
    if (IS_MOBILE){
        hideClientReceipts()
    }
    c_clients.enterCard = true;
    if (fetch){
        setTimeout(() => createClientOrderInvoiceImg(iid, 2), 500)
    }
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

function hideClientReports(){
    const parent = document.getElementById("client-reports")
    parent.classList.remove("show")
}

async function showClientReports(){
    const parent = document.getElementById("client-reports")
    if (typeof renderClientSummaryReport === "function"){
        renderClientSummaryReport()
    }
    parent.classList.add("show")
}

function editReceiptOrder(){
    const rid = c_runtime.currentInvoiceIdView
    const timg = document.getElementById("receiptImgTemplate");
    const tedit = document.getElementById("receiptEditTemplate");
    timg.classList.remove("show");
    tedit.classList.add("show")

    c_clients.receipt_edit = true;
    switchMenuActionClientCard()
}

function closeEditReceiptOrder(){
    const timg = document.getElementById("receiptImgTemplate");
    const tedit = document.getElementById("receiptEditTemplate");
    timg.classList.add("show");
    tedit.classList.remove("show")

    c_clients.receipt_edit = false;
    switchMenuActionClientCard()
}



/** ACTIONS */

async function editExistOrder(order_id = c_runtime.currentOrderIdView){
    if (!c_clients.client_view){
            if (!c_runtime.currentClientIdView){
                const client = get_client_by_order_id(order_id)
                if (client){
                    c_runtime.currentClientIdView = client.client_id;
                }
                
            }
        await openClientDashbaord(c_runtime.currentClientIdView, order_id, false)
    }
    c_clients.order_edit = true; 
    c_runtime.currentOrderIdView = order_id;
    if (!order_id)return
    await fetchClientOrder(order_id, ApiCall.order_edit)
    const parentBody = document.getElementById("client-template-dashboard")
    parentBody.scrollTop = 0;
    switchMenuActionClientCard()
}

function shareReceiptToClientAsPhoto(iid = c_runtime.currentInvoiceIdView){

}


async function initSelectOrderTypeToCreate(){
    c_clients.new_order = true;
    await openClientDashbaord(c_runtime.currentClientIdView, null, false)
    showSelectOrderTypeToCreate();

}

function filterTypeCleanOrderItems(value = "") {
    const tcoItems = document.getElementById("tcoItems");
    if (!tcoItems) return;

    const searchValue = (value || "").trim().toLowerCase();
    const items = tcoItems.querySelectorAll(".tco-item");

    items.forEach((item) => {
        const itemText = (item.dataset.searchText || item.textContent || "").toLowerCase();
        const matches = !searchValue || itemText.includes(searchValue);
        item.classList.toggle("is-hidden", !matches);
        if (matches) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}

function setupTypeCleanOrderSearch() {
    const searchInput = document.getElementById("tcoSearch");
    if (!searchInput) return;

    searchInput.oninput = (event) => filterTypeCleanOrderItems(event.target.value);
}

function showSelectOrderTypeToCreate(exist = false){
    const typeClean = document.getElementById("typeCleanOrder");
    const tcoItems = document.getElementById("tcoItems");
    if (tcoItems.children.length){
        typeClean.classList.remove("show")
        tcoItems.replaceChildren()
        return;
    }
    for (let [flag_name, flag] of Object.entries(CleanOrderType)){
        const name = getCleanOrderTypeText(flag)
        const icon = getCleanOrderTypeIcon(flag)
        const searchableName = `${name}`.toLowerCase();
        const html = `
        <div class="tco-item" data-search-text="${searchableName}" onclick="SelectOrderTypeToCreate(this, ${flag},${exist});showSelectOrderTypeToCreate()">
            <div class="tcoi-header">
                ${name}
            </div>
            <div class="tcoi-body">
                <i class="${icon}"></i>
            </div>
        </div>`
        tcoItems.innerHTML += html;
    }

    const searchInput = document.getElementById("tcoSearch");
    if (searchInput) {
        searchInput.value = "";
    }

    setupTypeCleanOrderSearch();
    filterTypeCleanOrderItems("");
    typeClean.classList.add("show")
}



function editExistCleanOrderType(element, flag) {
    c_clients.cot_selected = flag;
    const displaySpan = document.getElementById("dc1");
    if (displaySpan) displaySpan.textContent = getCleanOrderTypeTitle(flag);
    document.getElementById("typeCleanOrder")?.classList.remove("show");
}

function SelectOrderTypeToCreate(t, cot, exist = false){
    c_clients.cot_selected = cot;
    t.classList.add("selected")
    setTimeout(()=>{
        if (exist){
            editExistCleanOrderType(t, cot)
        }else{
        createOrder()
        }}, !exist ? 500 : 0)
}

async function createOrder(){
    await openClientDashbaord(c_runtime.currentClientIdView, null, false)
    await fetchClientOrder(null, ApiCall.order_new, {ot:c_clients.cot_selected})
    showClientOrder(c_runtime.currentOrderIdView, false)
}

function onSelectClientNewOrder(order){
    document.getElementById("fullname").value = order.fullname
    document.getElementById("client-phone").value = order.phone;
    document.getElementById("client-date").value = new Date().toISOString().split("T")[0];
    document.getElementById("client-location").value = order.address;
    document.getElementById("client-notes").value = order.notes;
    document.getElementById("client-price").value = order.price;
    docum
    const parent = document.getElementById("items-ordered");
    parent.replaceChildren();
    for (let [k,v] of Object.entries(order.items)){
        addItemClientOrder(v.name,v.price)
    }
}
function searchClientNewOrder(e){
    const value = e.target.value.toLowerCase();
    if (value == '')return

    const orders = c_runtime.orders.filter(o => o.fullname.toLowerCase().includes(value))
    const items = []
    for (let order of orders.slice(0, 4)){
            items.push({text:order.fullname, value:order.order_id, icon:"fa-solid fa-user"})
        
    }
    
    buildFilterOptions("mf-sc",items,(orderId)=>{onSelectClientNewOrder(get_order_by_order_id(orderId))})

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

function onSearchProductToOrder(index, value){
    const items = []
    const max = 5
    for (const product of c_runtime.products.filter(p =>p.raw.includes(value)).slice(0, max)){
        items.push({text:product.raw, icon:'fa-solid fa-barcode', value:product.key})
    }
    
    buildFilterOptions("mf-sp"+index, items, 
        (pk)=>{onSelectProductToOrder(index,getCILProductByKey(pk))},true)

}

function onSelectProductToOrder(index, product){
    const inputName = document.getElementById(`${index}-name`)
    const inputPrice = document.getElementById(`${index}-price`)
    inputName.value = product.raw;
    inputPrice.value = product.price;
    mainSyncTotalPrice(inputPrice)
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
    inputName.addEventListener('input', (e)=>{
        const value = e.target.value;
        if (!value || value == '')return
        onSearchProductToOrder(div.id, value)
    })


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

    const filter = document.createElement("div")
    filter.className = 'filter-options'
    filter.id = 'mf-sp'+div.id
    
    div.append(inputName, inputPrice, trash, filter);
    items.appendChild(div);
    c_runtime.items_ordered[div.id] = {name:name||'unknown',price:price||0}
    if (!name && !price) animateNewOrderItem(div)
}

function animateNewOrderItem(item){
    const input = item.querySelector('.c-input-item-name')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        input?.focus()
        return
    }
    const button = document.querySelector('.ci-add-item')
    if (!button){
        input?.focus()
        return
    }

    const buttonBox = button.getBoundingClientRect()
    const itemBox = item.getBoundingClientRect()
    const startX = buttonBox.left + buttonBox.width / 2 - 10
    const startY = buttonBox.top + buttonBox.height / 2 - 10
    const endX = itemBox.left + 12 - startX
    const endY = itemBox.top + itemBox.height / 2 - 10 - startY
    const flyItem = document.createElement('span')
    flyItem.className = 'item-order-fly'
    flyItem.innerHTML = '<i class="fa-solid fa-plus"></i>'
    flyItem.style.left = `${startX}px`
    flyItem.style.top = `${startY}px`
    flyItem.style.setProperty('--fly-mid-x', `${endX * .55}px`)
    flyItem.style.setProperty('--fly-mid-y', `${endY * .55 - 18}px`)
    flyItem.style.setProperty('--fly-x', `${endX}px`)
    flyItem.style.setProperty('--fly-y', `${endY}px`)
    document.body.appendChild(flyItem)
    item.style.opacity = '0'
    window.setTimeout(()=>{
        flyItem.remove()
        item.style.opacity = ''
        item.classList.add('item-order-landed')
        window.setTimeout(()=> item.classList.remove('item-order-landed'), 160)
        input?.focus()
    }, 390)
}

function deleteItemClientOrder(id_order){
    const parent = document.getElementById(id_order)
    if (!parent || parent.dataset.removing)return
    parent.dataset.removing = 'true'
    const element = document.getElementById(id_order+"-price")
    element.value  = 0
    mainSyncTotalPrice(element)
    delete c_runtime.items_ordered[id_order]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        parent.remove()
        return
    }
    parent.classList.add('item-order-evaporating')
    window.setTimeout(()=> parent.remove(), 280)
}

async function deleteReceiptFromDashbaord(receipt_id = c_runtime.currentInvoiceIdView){
    const success = () =>{
        switchViewClientDashboard(c_clients.currentCard,false, true)
        createListClientReceipts()
        removeOrderReceiptImg();
    }
    await deleteReceipt(receipt_id, success)
}

async function createReceiptFromDashbaord() {
    const createReceipt = await showAsk({title:message.notice, msg:message.IAboutCreateReceipt})
    if (!createReceipt){return}
    await createInvoice()
    switchMenuActionClientCard()
}

async function publisCleanOrderFromDashboard(stat) {
    await publishCleanOrder(c_runtime.currentOrderIdView, stat)
    switchMenuActionClientCard()
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
            
            showToast(`${client.fullname} ${getOrderStatText(state)}`, ToastStat.DONE, toast);
            
        }
    ))

}
