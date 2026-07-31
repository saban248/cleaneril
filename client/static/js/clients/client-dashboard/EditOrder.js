import { bindFilterComponent, createFilterComponent, createFilterOption, switchFilterOptions} from "../../MenuFilter.js";
import { generateHex } from "../../all.js";
import { fetchWorkers } from "../../main-loader.js";
import { get_order_by_order_id } from "../../manager.js";
import { c_clients } from "./dashboard.js";

let fullname = null;
const listSearchClientsId = 'fo-scnw'
const listSearchClients = document.getElementById(listSearchClientsId);

function fillItemsOrder(){
    const itemsOrdered = document.getElementById("items-ordered");
    const children = itemsOrdered.children
    const length = children.length;
    const temp = []
    for (let index=0;index<length;index++){
        const name = children[index].children[0].textContent
        const price = children[index].children[1].textContent
        temp.push([name, price.replace(/[^\d]/g, "")])
    }
    itemsOrdered.replaceChildren()
    for (const edit of temp){
        addItemClientOrder(edit[0], edit[1]);
    }

}


export function addItemClientOrder(name, price) {
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


function searchClientNewOrder(e){
    
    const parent = document.getElementById("fo-scnw")
    parent.replaceChildren();    
    const value = e.target.value.toLowerCase();
    if (value == '')return
    const match = c_runtime.orders.filter(o => o.fullname.toLowerCase().startsWith(value));
    if (!match){return}
    for (const order of match.slice(0, 4)) {
        const option = {
            value: order.order_id,
            text: order.fullname,
            id: generateHex(22)
        };

        parent.insertAdjacentHTML("beforeend", createFilterOption(option));

        document
            .getElementById(option.id)
            .addEventListener("click", () => selectClientNewOrder(order));
    }
    switchFilterOptions(parent)


}
function selectClientNewOrder(order){
    const itemsOrdered = document.getElementById("items-ordered");
    itemsOrdered.replaceChildren()
    const name = document.getElementById("fullname");
    const address = document.getElementById("client-location")
    const phone = document.getElementById("client-phone");
    const orderPrice = document.getElementById("client-price");
    const orderOffPrice = document.getElementById("client-off-price")
    const orderExpense = document.getElementById("client-expense")

    for (let [k,v] of Object.entries(order.items)){
        addItemClientOrder(v.name,v.price)
    }
    name.value = order.fullname;
    address.value = order.address;
    phone.value = order.phone;
    orderPrice.value = order.price;
    orderOffPrice.value = order.off_price;
    orderExpense.value = order.expense;
    
}




export async function onLoadEditOrder(oid){
    const itemsOrdered = document.getElementById("items-ordered");

    fillItemsOrder()
    await fetchWorkers()

    const order = get_order_by_order_id(oid)
    if (order){
        c_clients.cot_selected = order.order_type;
        for (let sw of c_runtime.workers){
            if (order.workers.includes(sw.employee_id)){
                selectWorkerToOrder(sw)
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
    
    // events
    onEditAddEvents()

}

function onEditAddEvents(){
    fullname = document.getElementById("fullname")
    fullname.addEventListener("input",(e) =>{
        searchClientNewOrder(e)
    })

}



function ft(nww){
    return parseInt(nww.replace(/[^\d]/g)||0)
}



function unSelectedworkerToOrder(worker){
    const inputfw = document.getElementById("client-worker")
    const workerSelected = document.getElementById("s"+worker.employee_id);
    const toAdd = workerSelected.offsetWidth+5
    inputfw.style.width = `${inputfw.offsetWidth-ft(inputfw.style.paddingRight)}px`
    inputfw.style.paddingRight = `${ft(inputfw.style.paddingRight)-toAdd}px`
    workerSelected.remove();

    onSetWorkerToOrder(worker);

}

function onSetWorkerToOrder(worker){
    const profitSharing = document.getElementById("psharing")
    const lengthSelected = document.getElementById("esm")?.children.length;
    if (worker.username.includes("אני") || !lengthSelected){
        profitSharing.classList.remove("show")
        return;
    }
    profitSharing.classList.add("show")

}


/**
 * 
 * @param {{username:'', employee_id:''}} worker 
 */
function selectWorkerToOrder(worker){
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

    onSetWorkerToOrder(worker)
}



function showDropdownWorkerSearch(){
    const dropdown = document.getElementById("worker-dropdown");
    dropdown.classList.add("show");
}
function hideDropdownWorkerSearch(){
    const dropdown = document.getElementById("worker-dropdown");
    dropdown.classList.remove("show");
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