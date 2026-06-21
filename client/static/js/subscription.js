const c_sub = {
    filterMenuOn:[],
    s:null,
    t:null,
    o:null
} 

function switchFilterOptions(_id){
    const off = document.getElementById(_id).classList.contains("show")
    for (cls of c_sub.filterMenuOn){
        document.getElementById(cls).classList.remove("show")
    }
    if (off){
        return
    }
    toggleFilterOptions(_id)
}


function toggleFilterOptions(_id) {
    const fss = document.getElementById(_id);
    fss.classList.toggle('show');

    if (!c_sub.filterMenuOn.includes(_id)){
        c_sub.filterMenuOn.push(_id)
    }
}



function selectSubscriptionState(_id, t) {
    const vss = document.getElementById('viewSubscriptionStat');
    const stat = parseInt(t.dataset.s);
    const statText = getSubscriptionStatText(stat);
    vss.textContent = statText
    c_sub.s = stat
    toggleFilterOptions(_id)
}


function selectSubscriptionType(_id, t){
    const vst = document.getElementById('viewSubscriptionType');
    const stat = parseInt(t.dataset.s);
    const statText = getSubscriptionTypeText(stat);
    vst.textContent = statText
    c_sub.t = stat
    toggleFilterOptions(_id)
}


function selectSubscriptionOrder(_id, t){
    const vso = document.getElementById('viewSubscriptionOrder');
    const stat = parseInt(t.dataset.s);
    c_sub.o = stat;
    const statText = getSubscriptionOrderText(stat);
    console.log(stat, statText)
    vso.textContent = statText
    toggleFilterOptions(_id)
}


function closeSearchManager(t){
    closeSearchInput('searchManager', t)
    doSearchManagersLocal()
}



function createSubscriptionTableCell(text){
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

function createSubscriptionPermissionCell(permission, text, icon){
    if (permission == -1)
    const cell = document.createElement("td");
    const badge = document.createElement("span");
    const iconEl = document.createElement("i");
    const textEl = document.createElement("span");

    badge.className = `subscription-permission permission-${permission != -1 ? permission: 1}`;
    iconEl.className = icon;
    textEl.textContent = text;

    badge.append(iconEl, textEl);
    cell.appendChild(badge);
    return cell;
}

function getLastTimeManagerAliveHourAndYMD(timeAlive){
    if (!timeAlive)return "-";
    if (timeAlive > 1e12)timeAlive = timeAlive / 1000;

    const date = new Date(timeAlive * 1000);
    const today = new Date();
    const isToday = date.toLocaleDateString('he-IL') == today.toLocaleDateString('he-IL');
    if (isToday)return `${dateFloatToHour(timeAlive)} היום`;

    const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
    const monthYear = date.toLocaleDateString('he-IL', {
        month: '2-digit',
        year: 'numeric'
    }).replace("/", ".");

    return `${dayName} ${dateFloatToHour(timeAlive)} ${monthYear}`;
}

const menuItemsSubscription = [
    { text: "צפייה", action: (managerId) => showToast("אפשרות צפייה עדיין לא פעילה", ToastStat.ERROR), icon:'<i class="fa-solid fa-eye"></i>'},
    { text: "עריכה", action: (managerId) => showToast("אפשרות עריכה עדיין לא פעילה", ToastStat.ERROR), icon:'<i class="fa-solid fa-pencil"></i>'},
    { text: "מחיקה", action: (managerId) => showToast("אפשרות מחיקה עדיין לא פעילה", ToastStat.ERROR), icon:'<i class="fa-solid fa-trash-can trash"></i>'},
]

function openMenuSubscription(e, managerId){
    e.stopPropagation();

    const menu = document.getElementById("subscriptionMenu");
    if (!menu)return;

    if (menu.classList.contains("show") && menu.dataset.managerId == managerId){
        menu.classList.remove("show");
        return;
    }

    menu.dataset.managerId = managerId;
    menu.innerHTML = "";

    menuItemsSubscription.forEach(item => {
        const cma = document.createElement("div");
        cma.className = "cma";

        const cma1 = document.createElement("div");
        cma1.className = "cma1";
        cma1.innerHTML = item.icon;

        const cma2 = document.createElement("div");
        cma2.className = "cma2";
        cma2.textContent = item.text;

        cma.append(cma1, cma2);
        cma.onclick = (event) => {
            event.stopPropagation();
            item.action(managerId);
            menu.classList.remove("show");
        }

        menu.appendChild(cma);
    });

    menu.style.visibility = "hidden";
    menu.style.top = "0px";
    menu.style.left = "0px";
    menu.classList.add("show");

    const margin = 8;
    const gap = 6;
    const rect = menu.getBoundingClientRect();
    const openAbove = e.clientY + rect.height + gap > window.innerHeight - margin;
    let top = openAbove ? e.clientY - rect.height - gap : e.clientY + gap;
    let left = e.clientX - rect.width;

    if (left < margin)left = e.clientX;
    if (left + rect.width > window.innerWidth - margin)left = window.innerWidth - rect.width - margin;
    if (top < margin)top = margin;
    if (top + rect.height > window.innerHeight - margin)top = window.innerHeight - rect.height - margin;

    menu.style.transformOrigin = openAbove ? "bottom right" : "top right";
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = "";
}

function createSubscriptionTableItem(manager, company){
    const row = document.createElement("tr");
    const managerId = manager.manager_id;
    const permission = manager.permission;
    const time_alive = (Date.now() - manager.time_alive * 1000) / 1000
    const register_done = company.register_level == RegisterApi.DONE
    const verified = false
    const phone = manager.phone
    const vat = company?.company_VAT || company?.vat || "";
    const [p_text, p_icon] = getManagerPermissionIconText(permission)

    row.id = managerId;
    row.className = "subscription-table-item";
    row.onclick = (e) => openMenuSubscription(e, managerId);

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `subscription-status ${time_alive < 120 ? "connected" : "disconnected"}`;
    status.textContent = time_alive < 120 ? "מחובר" : getLastTimeManagerAliveHourAndYMD(manager.time_alive) 
    statusCell.appendChild(status);

    row.append(
        statusCell,
        createSubscriptionTableCell(company.company_name),
        createSubscriptionPermissionCell(permission, p_text, p_icon),
        createSubscriptionTableCell(verified ? "כן":"לא"),
        createSubscriptionTableCell(register_done ? "לא הושלם": "הושלם"),

    );

    return row;
}

function renderSubscriptionTable(){
    const tableBody = document.getElementById("subscriptionsTableBody");
    if (!tableBody)return;
    const managers = Array.isArray(c_runtime.managers) ? c_runtime.managers : [];

    tableBody.innerHTML = "";

    if (!managers.length){
        const emptyRow = document.createElement("tr");
        emptyRow.className = "subscriptions-empty-row";
        emptyRow.innerHTML = `<td colspan="5">אין מנויים להצגה</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    for (const manager of managers){
        const company = getCompanyByManagerId(manager.manager_id)
        if (!company)continue;
        tableBody.appendChild(createSubscriptionTableItem(manager, company));
    }
}


function doSearchManagersLocal(){
    const input = document.getElementById("searchManager")
    const value = input.value.toLowerCase();
    const managers = Array.isArray(c_runtime.managers) ? c_runtime.managers : [];
    for (const manager of managers){
        const manager_id = manager.manager_id
        const row = document.getElementById(manager_id);
        if ((value == ''||manager.phone.includes(value))){
            row?.classList.remove("hide")
        }
        else{
            row?.classList.add("hide")
        }
    }
}

document.addEventListener("click", e => {
    const menu = document.getElementById("subscriptionMenu");
    if (!menu)return;
    if (!menu.contains(e.target)){
        menu.classList.remove("show");
    }
})
