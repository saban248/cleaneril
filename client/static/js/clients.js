const c_runtime = {
    items_ordered:{},
    state_client_selected:0,
    state_calendar_selected:0,
    workers:[],
    blockPublishClient:false
}

async function viewclientDetails(client_id){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');
    CONFIG.CLIENT_VIEW =true;

    data = {action:ApiCall.client_view, ci:client_id}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('client-template')
            editBody.innerHTML = res.template;
            reslove();
        }
    ))

}
function createClient(client_id=null){
    if (c_runtime.blockPublishClient)return;
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');

    data = {action:ApiCall.client_editor, ci:client_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('client-template')
            editBody.innerHTML = res.template;
            if (CONFIG.CLIENT_EDIT || !client_id){
                onLoadEditClient()
            }
            
        }
    )
}



function closeCreateClient(no_api=false){
    
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove("show")
    mainEdit.classList.add("hide")
    const client_id   = document.getElementById("the-client-card")?.dataset.ci;
   ( !no_api && (!CONFIG.CLIENT_EDIT && !CONFIG.CLIENT_VIEW))&& deleteClient(client_id)
   CONFIG.CLIENT_EDIT =false;
   CONFIG.CLIENT_VIEW =false;

}


function deleteClient(client_id){
    if (!confirm("continue?"))return;
    data = {ci:client_id, action:ApiCall.client_delete}
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(client_id)?.remove();

        }
    )

}


function editOrdersClient(){
    const parent = document.getElementById("items-ordered");

    const length = parent.childElementCount;
    const temp = []
    for (let index=1;index<length;index++){
        const name = document.getElementById(index+"-name").textContent
        const price = ft(document.getElementById(index+"-price").textContent)
        document.getElementById(index).remove();
        temp.push([name, price])
    }
    for (edit of temp){
        addItemOrder(edit[0], edit[1]);
    }

}

function addItemOrder(name, price) {
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
    trash.onclick = ()=>{deleteItemOrder(div.id)}

    div.append(inputName, inputPrice, trash);
    items.appendChild(div);
    c_runtime.items_ordered[div.id] = {}
}

function deleteItemOrder(id_order){
    const parent = document.getElementById(id_order) 
    const element = document.getElementById(id_order+"-price")
    element.value = -parseInt(element.innerText)
    mainSyncTotalPrice(element)
    delete c_runtime.items_ordered[id_order]
    parent.remove()
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
        iClass ="fa-solid fa-calendar-check progress-icon-done"
        icon.classList = iClass
        title.textContent = 'ההזמנה נשמרה'
        title.classList.add("progress-title-done")
        aAction.classList.add("show");
        bAction.classList.add("hide");
        
        return;
    }

    fn.textContent = "עבור: "+fullname;
    st.textContent = "סוג הזמנה: "+getStateClientText(parseInt(stat))
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
        notes:notes,price:price,vat:vat,ex:expense,ps:profitSharing,worker:worker,coordinate:[lat,lng]
    }
    apiPost(ApiRoute.api,data).then(
        (res)=>{
            if (!res.success){
                openPopup(res.title, res.notice)
                c_runtime.blockPublishClient = false;
                onPublishClientHideProgress();
                return
            }
            // closeCreateClient(true)
            // location.reload()
            onPublishClientShowProgress(null,null,true)
            c_runtime.blockPublishClient = false
            c_runtime.items_ordered = {}
        }
    )

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
    setTimeout(()=>{location.reload()},  2000)
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
function editExistClient(client_id){
    CONFIG.CLIENT_EDIT = true;
    createClient(client_id)
}


function setStateClient(client_id, state){
    data = {action: ApiCall.client_state, ci:client_id, s:state}

    apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }
            location.reload();
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



const menuItems = [
    { text: "צפיה", action: (cid) => viewclientDetails(cid), icon:'<i class="fa-solid fa-eye"></i>'},
    { text: "שיתוף כתמונה", action: (cid) => shareOrderToClientAsPhoto(cid), icon:'<i class="fa-solid fa-share-from-square"></i>'},
    { text: "שיתוף כקישור", action: (cid) => shareOrderToClientAsLink(cid), icon:'<i class="fa-solid fa-share-from-square"></i>'},
    { text: "עריכה", action: (cid) => editExistClient(cid), icon:'<i class="fa-solid fa-pencil"></>'},
    { text: "מחיקה", action: (cid) => deleteClient(cid), icon:'<i class="fa-solid fa-trash-can trash"></i>'},
    {text:'בוטל',action:(cid)=>setStateClient(cid, StateClient.CANCELED),icon:'<i class="fa-solid fa-ban"></i>'},
    {text:'הושלם', action:(cid)=>setStateClient(cid, StateClient.DONE), icon:'<i class="fa-solid fa-clipboard-check"></i>'},
    {text:'לא נסגר',action:(cid)=>setStateClient(cid, StateClient.WAIT), icon:'<i class="fa-solid fa-question"></i>'},
    {text:'בהמתנה',action:(cid)=>setStateClient(cid, StateClient.CLOSED), icon:'<i class="fa-solid fa-hourglass-half"></i>'}

]

function openMenuClient(t, cid) {
    const menu = document.getElementById("clientMenu")

    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    const rect = t.getBoundingClientRect()
    menu.innerHTML = "" // ניקוי

    menuItems.forEach(item => {
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
            item.action(cid)
            menu.classList.remove("show")
        }
        menu.appendChild(cma)
    })

    menu.style.top = `${rect.bottom + window.scrollY + 6}px`
    menu.style.left = `${rect.left + window.scrollX}px`

    menu.classList.add("show")
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

    menu.style.top = `${rect.bottom + window.scrollY + 6}px`
    menu.style.left = `${rect.left + window.scrollX}px`

    menu.classList.add("show")
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
    if (!worker)return
    selectWorkerToClient(worker);

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
            openPopup(res.title, res.notice);
            return null;
        }
        c_runtime.workers = res.workers;
        return res.workers;

    })
}


// סגירה בלחיצה מחוץ
document.addEventListener("click", e => {
    const menu = document.getElementById("clientMenu")
    if (!menu.contains(e.target) && !e.target.classList.contains("menu-client")) {
        menu.classList.remove("show")
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

    const element = document.getElementById("client-template");

    const scale = 3;
    const targetWidth = 410;
    const realHeight = element.offsetHeight;
    element.style.height = `${realHeight+30}px`;

    // Render element to canvas
    const canvas = await html2canvas(element, {
    scale: scale,
    backgroundColor: "#ffffff",
    useCORS: true
    });


        // Prepare crop canvas
    const cropCanvas = document.createElement("canvas");
    const ctx = cropCanvas.getContext("2d");

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


}


async function shareOrderToClientAsPhoto(cid){
    await viewclientDetails(cid)
    await prepareOrderImage()
    const file = new File([CONFIG.IMG_ORDER], "order.png", { type: "image/png" });

    if (navigator.share) {
        await navigator.share({
            title: "הזמנה",
            text: "הזמנה חדשה",
            files: [file]
        });
    }
    closeCreateClient()
}

function shareOrderToClientAsLink(cid){
    
}