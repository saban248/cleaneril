const c_runtime = {
    items_ordered:{},
    state_client_selected:0,
    state_calendar_selected:0,
    workers:[],
    blockPublishClient:false,
    clients:[],
    showClientsFrom:new Date().getFullYear()-1,
    invoices:[],
    currentClientIdView:null,
    currentInvoiceIdView:null
}



function mainSyncTotalPrice(element){
    var currentValue = element.value;
    if (!currentValue == '' && !/^\d+$/.test(currentValue))return
    if (currentValue == ''){currentValue = 0}
    const clientPrice = document.getElementById("client-price")
    const __items_ordered = document.getElementById('items-ordered').children.length;
    let total = 0
    for (let i=1;i<__items_ordered;i++){
        var p = document.getElementById(i+'-price'); 
        const value = p?.value?p.value.replace(/[^\d]/g, ""):p.innerText.replace(/[^\d]/g, "")
        if (element == p)continue
        total += parseInt((value||0))
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
    const aAction = document.getElementById("afterProgressDone")
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


async function publishClient(client_id, state){
    if (c_runtime.blockPublishClient)return;
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
    for (let i=1;i<=__items_ordered;i++){
        var n = document.getElementById(i+'-name');
        var p = document.getElementById(i+'-price'); 
        if (n==null||p==null)continue
        c_runtime.items_ordered[i] = {name:n.value||n.textContent, price:parseInt((p.value||p.textContent).replace(/\D+/g, ''),10)}
    }
    const notes = document.getElementById('client-notes').value;
    const price = document.getElementById('client-price').value;
    const vat = Boolean(document.getElementById('client-vat').checked)
    const offPrice = document.getElementById('client-off-price').value;
    const expense = document.getElementById("client-expense").value;
    const profitSharing = ft(document.getElementById("profitSharing").value);
    const w = document.getElementById('esm')?.children[0]
    const worker = w?w.id.substring(1,32):''

    onPublishClientShowProgress(fullname, state);

    /** coordinate */
    const [lat, lng] = await geocodeAddressOSM(address)
    const data = {action:ApiCall.client_save,
        ci:client_id, s:state,
        phone:phone,o:Boolean(parseInt(offPrice)),
        op:offPrice,fn:fullname,
        address:address, i:JSON.stringify(c_runtime.items_ordered),
        lf:SocialMedia.WHATSAPP,date:timing,
        notes:notes,price:price,vat:vat,ex:expense,ps:profitSharing,worker:worker,coordinate:[lat,lng],
        pt:0
    }
    const toast = showToast("מעבד...");
    apiPost(ApiRoute.api,data).then(
        async (res)=>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                onPublishClientHideProgress();
            }else{
                onPublishClientShowProgress(fullname,state, true)
                c_runtime.items_ordered = {}
                showToast(res.notice, ToastStat.DONE, toast);
                await fetchClients();
                createListClientOrders()
            }
            c_runtime.blockPublishClient = false
            c_clients.order_edit = c_clients.new_order = false;
        }
    )

}

function closeSearchClients(t){
    const input = document.getElementById("searchClient")
    input.classList.remove("show")
    const [ix, io] = [t.parentElement.children[0], t.parentElement.children[1]]
    ix.style.display = "none"
    io.style.display = "block"

    input.value = '';
    doSearchClientsLocal()
}
function openSearchClients(t){
    const input = document.getElementById("searchClient")
    input.classList.add("show")
    const [ix, io] = [t.parentElement.children[0], t.parentElement.children[1]]
    ix.style.display = "block"
    io.style.display = "none"

}

function doSearchClientsLocal(){
    const input = document.getElementById("searchClient")
    const value = input.value.toLowerCase();
    for (client of c_runtime.clients){
        const phone = cleanPhoneJustNumbers(client.phone).includes(value);
        const name = client.fullname.toLowerCase().includes(value);
        const date = dateFloatToYMD(client.date).includes(value);
        if ((value == ''||phone||name||date) && c_runtime.state_client_selected&client.state){
            document.getElementById(client.client_id).classList.remove("hide")
        }
        else{
            document.getElementById(client.client_id).classList.add("hide")
        }
    }
}
function sortedClientsByState(){
    const parent = document.getElementById("listClients")
    for (child of parent.children){
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

    updateStateClientSetting(c_runtime.state_client_selected, ManagerCache.getClientsCalender())
    sortedClientsByState()
}

function updateMACSOnLoad(cache = true){
    const parent = document.getElementById("macs").children
    const ca = Array.from(parent);
    for (state of ca){
        const s = state.dataset.s
        if (c_runtime.state_client_selected&s){
            updateMenuActionClientsSorted(state, s,cache)
        }
    }
    const calender = document.getElementById("acc")
    calender.innerText = getCalenderClientText(parseInt(ManagerCache.getClientsCalender()))

}

function updateStateClientSetting(state, calender){
    const params = new URLSearchParams(window.location.search);
    params.set("s", state)
    params.set("c", calender)
    window.history.replaceState({}, "", window.location.pathname + "?" + params.toString());
    ManagerCache.setClientsSortedState(state)
    c_runtime.state_client_selected = state
}


function setStateClient(client_id, state){
    data = {action: ApiCall.client_state, ci:client_id, s:state}
    const client = c_runtime.clients.find(c => c.client_id === client_id) || null
    const toast = showToast("מעבד...");
    apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice)
                return
            }
            fetchClients();
            showToast(`${client.fullname} ${getStateClientText(state)}`, ToastStat.DONE, toast);
            
        }
    )

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
    { text: "צפיה", action: (cid) => openClientDashbaord(cid), icon:'<i class="fa-solid fa-eye"></i>'},
    { text: "עריכה", action: (cid) => editExistOrder(cid), icon:'<i class="fa-solid fa-pencil"></>'},
    { text: "מחיקה", action: (cid) => deleteOrder(cid), icon:'<i class="fa-solid fa-trash-can trash"></i>'},
    {text:'בוטל',action:(cid)=>setStateClient(cid, StateOrder.CANCELED),icon:'<i class="fa-solid fa-ban"></i>'},
    {text:'הושלם', action:(cid)=>setStateClient(cid, StateOrder.DONE), icon:'<i class="fa-solid fa-clipboard-check"></i>'},
    {text:'לא נסגר',action:(cid)=>setStateClient(cid, StateOrder.WAIT), icon:'<i class="fa-solid fa-question"></i>'},
    {text:'בהמתנה',action:(cid)=>setStateClient(cid, StateOrder.CLOSED), icon:'<i class="fa-solid fa-hourglass-half"></i>'},
    {text:'צור קבלה',action:(cid)=>createInvoice(cid), icon:'<i class="fa-solid fa-file-invoice"></i>'},

]

function openMenuClient(t, cid) {
    const menu = document.getElementById("clientMenu")
    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    const rect = t.getBoundingClientRect()
    menu.replaceChildren() 
    // const client = c_runtime.clients.find(c => c.client_id == cid)
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
            item.action(cid)
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


function openMenuCalander(t){
    const menu = document.getElementById("calanderClients")
    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    const rect = t.getBoundingClientRect()
    menu.innerHTML = "" // ניקוי
    calanderItems.forEach(item => {
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
            item.action(item.text)
            menu.classList.remove("show")
        }
        menu.appendChild(cma)
    })

    menu.classList.add("show")
    const menuWidth = menu.offsetWidth;
    const windowWidth = window.innerWidth;

    let left = rect.left;
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 5; 
    }

    menu.style.top = `${rect.bottom + window.scrollY + 6}px`
    menu.style.left = `${left + window.scrollX}px`
} 

async function onLoadEditClient(){
    editOrdersClient()
    await fetchWorkers()
    
    let worker = null
    for (sw of c_runtime.workers){
        let lastSelectWorker = document.getElementById("lsw"+sw.employee_id)
        if (lastSelectWorker!=undefined){
            worker = sw;
            break;
        }


    }
    if (worker){
        selectWorkerToClient(worker);
    }
    let paymentState = 0;
    const group = document.getElementById("payGroup");
    console.log(group)
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
    const defaultBtn = group.querySelector('[data-tp="2"]');
    defaultBtn.click();

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
    await apiPost(ApiRoute.api, data).then( res =>{
        if (!res.success){
            showToast(res.notice, ToastStat.ERROR);
            return null;
        }
        c_runtime.workers = res.workers;
        return res.workers;

    })
}


document.addEventListener("click", e => {
    const menu = document.getElementById("clientMenu")
    if (!menu.contains(e.target) && !e.target.classList.contains("menu-client")) {
        menu.classList.remove("show")
        menu.classList.remove("hide")
    }
})

// document.addEventListener("click", e => {
//     const menu = document.getElementById("calanderClients")
//     if (!menu.contains(e.target) && !e.target.classList.contains("action-client")) {
//         menu.classList.remove("show")
//     }
// })


document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("s")
    const calender = params.get("c")
    if (state){
        updateStateClientSetting(state, ManagerCache.getClientsCalender())
    }
    else{
        updateStateClientSetting(ManagerCache.getClientsSortedState(), calender?calender:ManagerCache.getClientsCalender())
    }
    updateMACSOnLoad(false)
});




async function prepareOrderImage() {
    const cropCanvas = document.createElement("canvas");
    const ctx = cropCanvas.getContext("2d");

    if (IS_MOBILE){
        const element = document.getElementById("client-template-dashboard");
        const scale = 3;
        const targetWidth = 410;
        const realHeight = element.offsetHeight;
        element.style.height = `${realHeight+30}px`;
        const canvas = await html2canvas(element, {
        scale: scale,
        backgroundColor: "#ffffff",
        useCORS: true
        });
        cropCanvas.width = targetWidth * scale;
        cropCanvas.height = canvas.height;

        const cropX = Math.max(0, (canvas.width - cropCanvas.width) / 2);

        ctx.drawImage(
        canvas,
        cropX,
        0,
        cropCanvas.width,
        canvas.height,
        0,
        0,
        cropCanvas.width,
        canvas.height
        );

        const image = await new Promise(resolve =>
            cropCanvas.toBlob(resolve, "image/png")
        );
        CONFIG.IMG_ORDER = image;
        element.style.height = `${realHeight}px`;
    }else{
        const element = document.getElementById("the-client-card");
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#fff'
        });
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
        
        CONFIG.IMG_ORDER = blob;
    }


}



function shareOrderToClientAsLink(cid){
    
}

async function fetchClients(){
    return await new Promise((reslove) => apiPost(ApiRoute.api,{action:ApiCall.client_list, fromY:c_runtime.showClientsFrom}).then(
        res =>{
            if (!res.success){
                showToast(messgae.EfetchClients)
                return
            }
            c_runtime.clients = res.clients;
            loadListClientsHtml()
            reslove();
        }
        
    ))
}

function loadListClientsHtml(){
    const parent = document.getElementById("listClients")
    parent.replaceChildren();
    c_runtime.clients.forEach(client => {
        const el = createClientItem(client);
        parent.appendChild(el);
    });
}
function createClientItem(client, actions = true, callback) {
    const div = document.createElement("div");
    div.className = "client-item"
    div.dataset.stat = client.state;
    div.dataset.key = client.key;
    div.id = client.client_id;
    if (!actions){
        div.onclick = () => callback()
    }else{
        div.ondblclick = () => openClientDashbaord(client.client_id);
    }

    var html = `
        <div class="avatar client-state-${client.state}">
        ${client.fullname?.[0] || "?"}
        </div>
        
        <div class="content">
        <div class="in-content">
            <div class="top">
            <span class="name">${client.fullname}</span>
            <span class="phone no-mobile">${client.phone}</span>
            </div>
            <div class="bottom">
            <span>${dateFloatToYMD(client.date)} ${dateFloatToHour(client.date)}</span><br>
            <span>${client.price -client.off_price || 0}₪ •</span>
            <span class="client-state-text-${client.state}">
                ${getStateClientText(client.state)}
            </span>
            </div>
        </div>
        </div>
    `;
    if (actions){
        const clientActions = `
        <div class="client-footer">
            <i class="fa-solid fa-eye no-mobile"></i>
            <i class="fa-solid fa-bars menu-client"></i>
        </div>
        `;
        html += clientActions;
        div.innerHTML = html
        const icons = div.querySelectorAll(".client-footer i");
        icons[1].onclick = (e) => openMenuClient(e.target, client.client_id);
        icons[0].onclick = () => openClientDashbaord(client.client_id);
    }
    else{
        div.innerHTML = html
    }
    return div;
}



document.addEventListener("DOMContentLoaded", function (){
    fetchClients()
})
