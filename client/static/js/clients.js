



function mainSyncTotalPrice(element){
    let currentValue = element.value;
    if (currentValue !== '' && !/^\d+$/.test(currentValue)) return;
    if (currentValue == ''){currentValue = 0}
    const clientPrice = document.getElementById("client-price")
    const __items_ordered = document.getElementById('items-ordered').children.length;
    let total = 0
    for (let i=0; i < __items_ordered; i++){
        const p = document.getElementById(i+'-price'); 
        const value = p?.value?p.value.replace(/[^\d]/g, ""):p.innerText.replace(/[^\d]/g, "")
        if (element === p || !p) continue
        total += parseInt(value || 0, 10);
    }

    clientPrice.value = total+parseInt(currentValue)
}

function compareVatOfPrice(t){
    const p_element = document.getElementById("client-price")
    const price = parseInt(p_element.value)
    const plhldr = parseInt(p_element.placeholder)
    if (!t.checked){
        p_element.value = plhldr
        return
    }

    p_element.value = price+(price*0.18)
    p_element.placeholder = price
}


function onPublishClientShowProgress(fullname, stat, done = false){
    const body = document.getElementById("clientOrderBody");
    const details = document.getElementById("clientOrderDetails");
    const progress = document.getElementById("clientProgressPublish");
    const fn = document.getElementById("cpp-fn")
    const st = document.getElementById("cpp-stat")
    const icon = document.getElementById("cpp-icon")
    const title = document.getElementById("cpp-title");
    const bAction = document.getElementById("beforeProgressDone");
    const aAction = document.getElementById("afterProgressDone");
    let iClass = "";
    if (!done){
        iClass = "fa-solid fa-circle-notch fa-spin"
        icon.classList = iClass
    }
    else{
        iClass ="fa-solid fa-calendar-check progress-icon-done ctype-"+stat;
        icon.classList = iClass
        title.textContent = 'ההזמנה נשמרה'
        title.classList.add("progress-title-done")
        aAction.classList.add("show");
        bAction.classList.add("hide");
        
        return;
    }

    fn.textContent = "עבור: "+fullname;
    st.children[0].textContent = getStateClientText(parseInt(stat))
    body.classList.add("hide");
    details.classList.add("hide");
    progress.classList.add("show");
}   

function onPublishClientHideProgress(){
    const body = document.getElementById("clientOrderBody");
    const details = document.getElementById("clientOrderDetails");
    const progress = document.getElementById("clientProgressPublish");
    body.classList.remove("hide");
    details.classList.remove("hide");
    progress.classList.remove("show");

}


async function publishCleanOrder(order_id, state){
    if (c_runtime.blockPublishClient)return;
    if (!order_id){
        order_id = c_runtime.currentOrderIdView
        if (!order_id){
            showToast(message.EneedRefresh, ToastStat.ERROR);
            return
        }
    }
    c_runtime.blockPublishClient =true;
    const fullname = document.getElementById('fullname').value;
    const date = document.getElementById('client-date').value;
    const ldate = new Date(date);
    const time = document.getElementById('client-time').value;
    const [hours, minutes] = time.split(':').map(Number);
    ldate.setHours(hours, minutes, 0, 0);
    const timing = Math.floor(ldate.getTime() / 1000)
    const address = document.getElementById('client-location').value;
    const phone = document.getElementById('client-phone').value;
    const __items_ordered = document.getElementById('items-ordered').children.length;
    for (let i=0; i <= __items_ordered; i++){
        const n = document.getElementById(i+'-name');
        const p = document.getElementById(i+'-price'); 
        if (n==null||p==null)continue
        c_runtime.items_ordered[i] = {name:n.value||n.textContent, price:parseInt((p.value||p.textContent).replace(/\D+/g, ''),10)}

    }

    const notes = document.getElementById('client-notes').value;
    const price = document.getElementById('client-price').value;
    const vat = Boolean(document.getElementById('client-vat').checked)
    const offPrice = document.getElementById('client-off-price').value;
    const expense = document.getElementById("client-expense").value;
    const profitSharing = ft(document.getElementById("profitSharing").value);
    const workers = []
    for (w of document.getElementById('esm').children){
        workers.push(w.id.replace("s", ''))
    }
    const pay_type = document.getElementById("payGroup").dataset.tp
    const pay_notes = ''
    const order_type = c_clients.cot_selected;

    onPublishClientShowProgress(fullname, state);

    /** coordinate */
    const [lat, lng] = await geocodeAddressOSM(address)
    const data = {action:ApiCall.order_save,
        oi:order_id, s:parseInt(state),
        phone:phone,o:Boolean(parseInt(offPrice)),
        op:offPrice,fn:fullname,
        address:address, i:JSON.stringify(c_runtime.items_ordered),
        lf:SocialMedia.WHATSAPP,date:timing,
        notes:notes,price:price,vat:vat,ex:expense,ps:profitSharing,workers:workers,coordinate:[lat,lng],
        pt:pay_type,pn:pay_notes,ot:order_type
    }
    const toast = showToast("מעבד...");
    return await new Promise((resolve) => apiPost(ApiRoute.api,data).then(
        async (res)=>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                onPublishClientHideProgress();
            }else{
                onPublishClientShowProgress(fullname,state, true)
                c_runtime.items_ordered = {}
                showToast(res.notice, ToastStat.DONE, toast);
                await fetchOrders();
                await fetchClients()
                createListClientOrders()
            }
            c_runtime.blockPublishClient = false
            c_clients.order_edit = c_clients.new_order = false;
            resolve();
        }
    ))

}


function closeSearchClients(t){
    closeSearchInput("searchClient", t)
    doSearchClientsLocal()
}

function doSearchClientsLocal(){
    const input = document.getElementById("searchClient")
    const value = input.value.toLowerCase();
    for (const order of c_runtime.orders){
        const order_id = order.order_id+'main'
        const phone = cleanPhoneJustNumbers(order.phone).includes(value);
        const name = order.fullname.toLowerCase().includes(value);
        const date = dateFloatToYMD(order.date).includes(value);
        const cid = order.client_id.toLowerCase() == value;
        if ((value == ''||phone||name||date||cid) && c_runtime.state_client_selected&order.stat){
            document.getElementById(order_id).classList.remove("hide")
        }
        else{
            document.getElementById(order_id).classList.add("hide")
        }
    }
}
function sortedClientsByState(){
    const parent = document.getElementById("listClients")
    for (const child of parent.children){
        if (parseInt(child.dataset.stat)&c_runtime.state_client_selected){
            child.classList.remove("hide")
        }
        else{
            child.classList.add("hide")
        }
    }
    
}
function selectClientsState(t){
    updateMenuActionClientsSorted(t, t.dataset.s)
}


function updateMenuActionClientsSorted(t, state, cache = true){
    const cSelected = "ac-selected"
    if (!t.classList.contains(cSelected)&& (!(state&c_runtime.state_client_selected) || !cache)){
        t.classList.add(cSelected)
        c_runtime.state_client_selected |= state
    }
    else{
        t.classList.remove(cSelected)
        c_runtime.state_client_selected &= ~state
    }
    if (!cache)return

    updateStateClientSetting(c_runtime.state_client_selected)
    sortedClientsByState()
}

function updateMACSOnLoad(cache = true){
    const parent = document.getElementById("macs").children
    const ca = Array.from(parent);
    for (const item of ca){
        const s = item.dataset.s
        if (c_runtime.state_client_selected&s){
            updateMenuActionClientsSorted(item, s, cache)
        }
    }

}

function updateStateClientSetting(state){
    const params = new URLSearchParams(window.location.search);
    params.set("s", state)
    window.history.replaceState({}, "", window.location.pathname + "?" + params.toString());
    ManagerCache.setClientsSortedState(state)
    c_runtime.state_client_selected = state
}


function updateCalanderClient(cc){
    const params = new URLSearchParams(window.location.search);
    params.set("c", cc)
    window.history.replaceState({}, "", window.location.pathname + "?" + params.toString());
    ManagerCache.setClientsCalender(cc)
    location.reload()
}


const menuItemsStateClients = [
    {text:'הושלם', action:(t)=>selectClientsState(t), icon:`<i class="fa-solid fa-clipboard-check"></i>`, stat:StateOrder.DONE},
    {text:'בהמתנה',action:(t)=>selectClientsState(t), icon:'<i class="fa-solid fa-hourglass-half ac2"></i>', stat:StateOrder.CLOSED},
    {text:'לא נסגר',action:(t)=>selectClientsState(t), icon:'<i class="fa-solid fa-question ac3"></i>', stat:StateOrder.WAIT},
    {text:'בוטל',action:(t)=>selectClientsState(t),icon:'<i class="fa-solid fa-ban ac4"></i>', stat:StateOrder.CANCELED},
]
function openMenuStateClients(t, stat){
    const menu = document.getElementById("stateClients")

    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }

    const rect = t.getBoundingClientRect()
    menu.innerHTML = ""

    let index = 1
    menuItemsStateClients.forEach(item => {
        let cma = document.createElement("div")
        cma.dataset.s = item.stat
        cma.className = "cma"
        let cma1 = document.createElement('div')
        cma1.className = "cma1"
        cma1.innerHTML = item.icon
        let cma2 = document.createElement("div")
        cma2.className = 'cma2'
        
        if (c_runtime.state_client_selected&item.stat){
            cma2.classList =`cma2 ac${index} ac-selected`
        }
        cma2.textContent = item.text
        cma.appendChild(cma1)
        cma.appendChild(cma2)

        cma.onclick = () => {
            item.action(cma)
            menu.classList.remove("show")
            openMenuStateClients(t, stat)
        }
        menu.appendChild(cma)
        index += 1
    })


    menu.classList.add("show")
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = rect.left;
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 5;
    }

    // 👇 בדיקה לגובה
    let top;

    if (rect.bottom + menuHeight > windowHeight) {
        // אין מקום למטה → פותחים למעלה
        top = rect.top - menuHeight - 6;
    } else {
        // יש מקום → רגיל למטה
        top = rect.bottom + 6;
    }

    menu.style.top = `${top + window.scrollY}px`;
    menu.style.left = `${left + window.scrollX}px`;


}
const menuItemsClient = [
    { text: "צפיה", action: (cid, oid) => openClientDashbaord(cid, oid), icon:'<i class="fa-solid fa-eye"></i>'},
    { text: "עריכה", action: (cid, oid) => editExistOrder(oid), icon:'<i class="fa-solid fa-pencil"></>'},
    { text: "מחיקה", action: (cid, oid) => deleteOrder(oid), icon:'<i class="fa-solid fa-trash-can trash"></i>'},
    {text:'בוטל',action:(cid, oid)=>setStateCleanOrder(oid, StateOrder.CANCELED),icon:'<i class="fa-solid fa-ban"></i>'},
    {text:'הושלם', action:(cid, oid)=>setStateCleanOrder(oid, StateOrder.DONE), icon:'<i class="fa-solid fa-clipboard-check"></i>'},
    {text:'לא נסגר',action:(cid, oid)=>setStateCleanOrder(oid, StateOrder.WAIT), icon:'<i class="fa-solid fa-question"></i>'},
    {text:'בהמתנה',action:(cid, oid)=>setStateCleanOrder(oid, StateOrder.CLOSED), icon:'<i class="fa-solid fa-hourglass-half"></i>'},
    {text:'צור קבלה',action:(cid, oid)=>createInvoice(cid, oid), icon:'<i class="fa-solid fa-file-invoice"></i>'},

]

function openMenuClient(t, cid, oid) {
    const menu = document.getElementById("clientMenu")
    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    const rect = t.getBoundingClientRect()
    menu.replaceChildren() 
    // const client = c_runtime.orders.find(c => c.client_id == cid)
    // const div = document.createElement("div")
    // div.innerText = client.fullname;
    // menu.appendChild(div)
    menuItemsClient.forEach(item => {
        let cma = document.createElement("div")
        cma.className = "cma"
        let cma1 = document.createElement('div')
        cma1.className = "cma1"
        cma1.innerHTML = item.icon
        
        let cma2 = document.createElement("div")
        cma2.className = 'cma2'
        cma2.textContent = item.text
        cma.appendChild(cma1)
        cma.appendChild(cma2)

        cma.onclick = () => {
            if (!item.action)return
            item.action(cid,oid)
            menu.classList.remove("show")
        }
        menu.appendChild(cma)
    })

    menu.classList.add("show")
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = rect.left;
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 5;
    }

    // 👇 בדיקה לגובה
    let top;

    if (rect.bottom + menuHeight > windowHeight) {
        // אין מקום למטה → פותחים למעלה
        top = rect.top - menuHeight - 6;
    } else {
        // יש מקום → רגיל למטה
        top = rect.bottom + 6;
    }

    menu.style.top = `${top + window.scrollY}px`;
    menu.style.left = `${left + window.scrollX}px`;
}


const calanderItems = [
    {text:'תמיד', action:(cc)=>{updateCalanderClient(CalanderClients.FOREVER)}, icon:'<i class="fa-solid fa-clock"></i>'},
    {text:'מחר', action:(cc)=>{updateCalanderClient(CalanderClients.TOMORROW)}, icon:'<i class="fa-solid fa-clock"></i>'},
    {text:"היום", action: (cc)=>{updateCalanderClient(CalanderClients.DAY)}, icon:'<i class="fa-solid fa-clock"></i>'},
    {text:"השבוע", action: (cc)=>{updateCalanderClient(CalanderClients.WEEK)}, icon:'<i class="fa-solid fa-clock"></i>'},
    {text:"שבועיים", action: (cc)=>{updateCalanderClient(CalanderClients.DWEEK)}, icon:'<i class="fa-solid fa-clock"></i>'},
    {text:"החודש", action: (cc)=>{updateCalanderClient(CalanderClients.MONTH)}, icon:'<i class="fa-solid fa-clock"></i>'}
]


function showCalendarOrders(t){
    
} 

async function onLoadEditClient(oid){
    editOrdersClient()
    await fetchWorkers()

    const order = get_order_by_order_id(oid)
    if (order){
        c_clients.cot_selected = order.order_type;
        for (let sw of c_runtime.workers){
            if (order.workers.includes(sw.employee_id)){
                selectWorkerToClient(sw)
            }

        }
    }

    let paymentState = 0;
    const group = document.getElementById("payGroup");
    const buttons = group.querySelectorAll("button");
    const indicator = group.querySelector(".indicator");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const value = Number(btn.dataset.tp);
            paymentState = value;
            group.dataset.tp = value;
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            moveIndicator(btn);
        });
    });

    function moveIndicator(btn) {
        const rect = btn.getBoundingClientRect();
        const parentRect = group.getBoundingClientRect();

        indicator.style.left = (rect.left - parentRect.left) + "px";
        indicator.style.width = rect.width + "px";
    }

    setTimeout( ()=> {
        if (!order){
            document.getElementById("tp-default").click()
            return
        }
        const pt = order.payment_type
        group.querySelector(`[data-tp="${pt}"]`).click();
    }, 500);

}

function onSearchWorker(){
    const input = document.getElementById("client-worker");
    const dropdown = document.getElementById("worker-dropdown");

    const value = input.value.toLowerCase();
    if (value == ''){
        hideDropdownWorkerSearch()
        return;
    };
    dropdown.innerHTML = "";

    const filtered = c_runtime.workers.filter(w =>
        w.username.toLowerCase().includes(value)
    );

    if(filtered.length === 0){
        hideDropdownWorkerSearch()
        return;
    }
    let x = 0
    filtered.forEach(worker=>{
        const parent = document.createElement("div");
        const icon = `<i class="fa-regular fa-user"></i>`
        const span = `<span>${worker.username}</span>`
        parent.className = "worker-search-item";
        parent.innerHTML = icon+span

        parent.onclick = () =>{
            selectWorkerToClient(worker)
        };

        if (x>2)return;
        dropdown.appendChild(parent);
        x+=1
    });
    showDropdownWorkerSearch()
}
function showDropdownWorkerSearch(){
    const dropdown = document.getElementById("worker-dropdown");
    dropdown.classList.add("show");
}
function hideDropdownWorkerSearch(){
    const dropdown = document.getElementById("worker-dropdown");
    dropdown.classList.remove("show");
}

function ft(nww){
    return parseInt(nww.replace(/[^\d]/g)||0)
}
/**
 * 
 * @param {{username:'', employee_id:''}} worker 
 */
function selectWorkerToClient(worker){
    if (document.getElementById("s"+worker.employee_id))return;
    const inputfw = document.getElementById("client-worker")
    inputfw.value =''
    onSearchWorker()
    const parent = document.getElementById("esm");
    const ws = document.createElement('div')
    ws.textContent = worker.username;
    ws.id = 's'+worker.employee_id;
    ws.classList.add("employee-selected");
    ws.onclick = () => {
        unSelectedworkerToClient(worker);
    }
    parent.appendChild(ws); 
    const toAdd = ws.offsetWidth+5
    inputfw.style.paddingRight = `${ft(inputfw.style.paddingRight)+toAdd}px`
    inputfw.style.width = `${inputfw.offsetWidth-ft(inputfw.style.paddingRight)}px`

    onSetWorkerToClient(worker)
}

function unSelectedworkerToClient(worker){
    const inputfw = document.getElementById("client-worker")
    const workerSelected = document.getElementById("s"+worker.employee_id);
    const toAdd = workerSelected.offsetWidth+5
    inputfw.style.width = `${inputfw.offsetWidth-ft(inputfw.style.paddingRight)}px`
    inputfw.style.paddingRight = `${ft(inputfw.style.paddingRight)-toAdd}px`
    workerSelected.remove();

    onSetWorkerToClient(worker);

}

function onSetWorkerToClient(worker){
    const profitSharing = document.getElementById("psharing")
    const lengthSelected = document.getElementById("esm")?.children.length;
    if (worker.username.includes("אני") || !lengthSelected){
        profitSharing.classList.remove("show")
        return;
    }
    profitSharing.classList.add("show")

}

async function fetchWorkers(){
    const data = {action:ApiCall.client_workers}
    return await new Promise((resolve) =>apiPost(ApiRoute.api, data).then( res =>{
        if (!res.success){
            showToast(res.notice, ToastStat.ERROR);
            resolve(null)
            return
        }
        c_runtime.workers = res.workers;
        resolve(res.workers)

    }))
}




document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("s")
    const calender = params.get("c")
    if (state){
        updateStateClientSetting(state, ManagerCache.getClientsCalender())
    }
    else{
        updateStateClientSetting(ManagerCache.getClientsSortedState())
    }
    updateMACSOnLoad(false)

    document.addEventListener("click", e => {
        const menu = document.getElementById("clientMenu")
        if (!menu.contains(e.target) && !e.target.classList.contains("menu-client")) {
            menu.classList.remove("show")
            menu.classList.remove("hide")
        }
    })
});




async function prepareOrderImage() {
    const element = document.getElementById("the-client-card");
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            backgroundColor: "#fff",
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        CONFIG.IMG_ORDER = blob;

    } catch (err) {
        showToast(err,ToastStat.ERROR)
        console.error("Image preparation failed:", err);
        CONFIG.IMG_ORDER = null;
    } finally {}
}



function shareOrderToClientAsLink(cid){
    
}

async function fetchClients() {
    return await new Promise((reslove) => apiPost(ApiRoute.api, {action:ApiCall.list_clients}).then(
        (res) => {
            if (!res.success){
                showToast(message.EfetchClients)
                reslove(res);
                return;
            }
            c_runtime.clients = res.clients;
            reslove(res);
        }
    ))
}

async function fetchOrders(){
    return await new Promise((reslove) => apiPost(ApiRoute.api,{action:ApiCall.orders_list, fromY:c_runtime.showClientsFrom}).then(
        res =>{
            if (!res.success){
                showToast(message.EfetchOrders)
                reslove(res);
                return
            }
            c_runtime.orders = res.orders;
            loadListClientsHtml()
            reslove(res);
        }
    ))
}

function loadListClientsHtml(){
    const parent = document.getElementById("listClients")
    const iid = "iel-orders-main"
    const iel = "icon-empty-list"
    const icon = document.getElementById(iid);
    const deleteChildren = ()=>{
        [...parent.children].forEach(child => {
            if (child.id !== iid) {
                child.remove();
            }
        });
    }
    deleteChildren();
    
    if (!c_runtime.orders.length){
        icon.style.display = 'block'
        parent.classList.add(iel)
        return
    }
    icon.style.display = 'none';
    parent.classList.remove(iel)

    c_runtime.orders.forEach(order => {
        const el = createOrderItem(order.client_id, order);
        parent.appendChild(el);
    });
    sortedClientsByState()
}
function createOrderItem(client_id, order, actions = true, callback) {
    const div = document.createElement("div");
    div.className = "client-item"
    div.dataset.stat = order.stat;
    div.dataset.key = order.key;
    if (!actions){
        div.id = order.order_id+"dashbaord";
        div.onclick = () => callback()
    }else{
        div.id = order.order_id+'main'
        div.ondblclick = () => openClientDashbaord(client_id, order.order_id);
    }


    var html = `
        <div class="avatar client-state-${order.stat}">
        ${order.fullname?.[0] || "?"}
        </div>
        
        <div class="content">
        <div class="in-content">
            <div class="top">
                <span class="name">${order.fullname}</span>
                <span class="phone no-mobile">${order.phone}</span>
            </div>
            <div class="bottom">
                <span>${dateFloatToYMD(order.date)} ${dateFloatToHour(order.date)}</span><br>
                <span>${order.price -order.off_price || 0}₪ •</span>
                <span class="client-state-text-${order.stat}">
                    ${getStateClientText(order.stat)}
                •</span>
                <i class="${getCleanOrderTypeIcon(order.order_type)}"></i>

            </div>
        </div>
        </div>
    `;
    if (actions){
        const orderActions = `
        <div class="client-footer">
            <i class="fa-solid fa-eye no-mobile"></i>
            <i class="fa-solid fa-bars menu-client"></i>
        </div>
        `;
        html += orderActions;
        div.innerHTML = html
        const icons = div.querySelectorAll(".client-footer i");
        icons[1].onclick = (e) => openMenuClient(e.target, client_id, order.order_id);
        icons[0].onclick = () => openClientDashbaord(c_runtime.currentClientIdView, order.order_id);
    }
    else{
        div.innerHTML = html
    }
    return div;
}
