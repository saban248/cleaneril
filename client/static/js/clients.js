const c_runtime = {
    items_ordered:{},
    state_client_selected:0
}

function viewclientDetails(client_id){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');
    CONFIG.CLIENT_VIEW =true;

    data = {action:ApiCall.client_view, ci:client_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('client-template')
            editBody.innerHTML = res.template;
        }
    )

}
function createClient(client_id=null){
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
    console.log(data)
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(client_id)?.remove();

        }
    )

}



function addItemOrder() {
    const items = document.getElementById("items-ordered");

    const div = document.createElement("div");
    div.className = "ordered";
    div.id = items.childElementCount;

    const inputName = document.createElement("input");
    inputName.classList.add('c-input-item-name')
    inputName.id = `${div.id}-name`


    const inputPrice = document.createElement("input");
    inputPrice.classList.add('c-input-fn')
    inputPrice.id = `${div.id}-price`

    const trash = document.createElement('i')
    trash.classList = "fa-solid fa-trash-can trash-order"
    trash.onclick = ()=>{deleteItemOrder(div.id)}

    div.append(inputName, inputPrice, trash);
    items.appendChild(div);
    c_runtime.items_ordered[div.id] = {}
}

function deleteItemOrder(id_order){
    document.getElementById(id_order)?.remove()
    delete c_runtime.items_ordered[id_order]
}



function publishClient(client_id, state){
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

    for (let i=1;i<__items_ordered;i++){
        var n = document.getElementById(i+'-name');
        var p = document.getElementById(i+'-price'); 
        c_runtime.items_ordered[i] = {name:n.value||n.textContent, price:parseInt((p.value||p.textContent).replace(/\D+/g, ''),10)}
    }
    const notes = document.getElementById('client-notes').value;
    const price = document.getElementById('client-price').value;
    const vat = Boolean(document.getElementById('client-vat').checked)
    const offPrice = document.getElementById('client-off-price').value;

    const data = {action:ApiCall.client_save,
        ci:client_id, s:state,
        phone:phone,o:Boolean(parseInt(offPrice)),
        op:offPrice,fn:fullname,
        address:address, i:JSON.stringify(c_runtime.items_ordered),
        lf:SocialMedia.WHATSAPP,date:timing,
        notes:notes,price:price,vat:vat
    }

    apiPost(ApiRoute.api,data).then(
        (res)=>{
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }
            closeCreateClient(true)
            location.reload()
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

    updateStateClientSetting(c_runtime.state_client_selected)
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
        updateStateClientSetting(ManagerCache.getClientsSortedState())
    }
    updateMACSOnLoad(false)
});