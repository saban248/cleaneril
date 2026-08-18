function showTimelineEmpty(){
    const parent = document.getElementById("scheduleContentEmpty")
    parent.classList.add("show")
}
function hideTimelineEmpty(){
    const parent = document.getElementById("scheduleContentEmpty")
    parent.classList.remove("show")
}
function showTimeline(){
    const parent = document.getElementById("scheduleCTimeline")
    parent.classList.add("show")
}
function hideTimeline(){
    const parent = document.getElementById("scheduleCTimeline")
    parent.classList.remove("show")
}

const c_timeline = {
    selectedWorkerId: getCurrentManagerId(),
    filterTimelineWorker:{}
}

function getScheduleStatusName(stat){
    switch (stat) {
        case StateOrder.CANCELED:
            return 'cancel'
        case StateOrder.CLOSED:
            return 'current'
        case StateOrder.DONE:
            return "done"
    }
    return ''
}

function getScheduleIconStatus(order){
    const stat = order.stat;
    switch (stat) {
        case StateOrder.CANCELED:
            return 'cancel'
        case StateOrder.CLOSED:
            if (isClientDateOrderInRangeHour(order.date)){
                return "loading"
            }
            return "closed"
        case StateOrder.DONE:
            return "done"
    }   
}

function getOrderWorkerIds(order){
    let workers = order?.workers || [];
    if (!Array.isArray(workers)){
        return [];
    }
    return workers
}

function isTimelineOrderForWorker(day, order){
    return order.workers.includes(c_timeline.filterTimelineWorker[day])
}

function getTimelineOrders(){
    const orders = Array.isArray(c_runtime.orders) ? c_runtime.orders : [];
    const now = new Date();
    const days = [];

    for (let i = 0; i <= 3; i++){
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
        const from = start.getTime() / 1000;
        const to = end.getTime() / 1000;

        days.push({
            date: start,
            orders: orders
                .filter(order => {
                    const date = Number(order.date);
                    return date >= from && date < to && isTimelineOrderForWorker(i, order);
                })
                .sort((a, b) => Number(a.date || 0) - Number(b.date || 0))
        });
        c_timeline.filterTimelineWorker[i] = getCurrentManagerId();
    }

    return days;
}

function getTimelineDateTitle(date){
    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function getTimelineSelectedWorkerName(day = 0){
    const workers = Array.isArray(c_runtime.workers) ? c_runtime.workers : [];
    const worker = workers.find(worker => worker == c_timeline.filterTimelineWorker[day])
    if (worker == getCurrentManagerId()){
        return getCurrentManagerName()
    }
    return worker.username

}

function closeTimelineWorkerFilters(){
    document.querySelectorAll(".schedule-worker-filter .filter-options.show").forEach(menu => {
        menu.classList.remove("show");
    });
}

function createTimelineWorkerFilter(){
    const filter = document.createElement("div");
    filter.className = "action-search";

    const selected = document.createElement("span");
    selected.className = "viewFilterSelected";
    selected.textContent = getTimelineSelectedWorkerName();
    selected.onclick = (e) => {
        e.stopPropagation();
        const options = filter.querySelector(".filter-options");
        const isOpen = options.classList.contains("show");
        closeTimelineWorkerFilters();
        if (!isOpen){
            options.classList.add("show");
        }
    }

    const options = document.createElement("div");
    options.className = "filter-options";

    const addOption = (workerId, text, iconClass) => {
        const option = document.createElement("div");
        const iconEl = document.createElement("i");
        const textEl = document.createElement("span");

        option.className = "filter-option";
        option.dataset.workerId = workerId;
        iconEl.className = iconClass;
        textEl.textContent = text;
        option.append(iconEl, textEl);
        option.onclick = (e) => {
            e.stopPropagation();
            c_timeline.selectedWorkerId = workerId;
            closeTimelineWorkerFilters();
            renderTimeLine();
        }
        options.appendChild(option);
    }

    addOption("all", "כל העובדים", "fa-solid fa-users");

    const workers = Array.isArray(c_runtime.workers) ? c_runtime.workers : [];
    workers.forEach(worker => {
        addOption(String(worker.employee_id), worker.username, "fa-solid fa-user");
    });

    filter.append(selected, options);
    return filter;
}

document.addEventListener("click", () => {
    closeTimelineWorkerFilters();
});

function createTimelineWorkerFilterControl(){
    return createTimelineWorkerFilter();
}

function createTimelineEmptyDay(){
    const empty = document.createElement("div");
    empty.className = "schedule-day-empty";
    empty.innerHTML = `
        <i class="fa-solid fa-calendar-day"></i>
        <span>אין הזמנות ביום הזה</span>
    `;
    return empty;
}

async function createTimelineDaySection(day){
    const section = document.createElement("section");
    section.className = "schedule-day-section";

    const separator = document.createElement("div");
    separator.className = "schedule-day-separator";

    const title = document.createElement("span");
    title.textContent = getTimelineDateTitle(day.date);
    separator.append(title, createTimelineWorkerFilterControl());

    const list = document.createElement("div");
    list.className = "schedule-day-list";

    if (!day.orders.length){
        list.appendChild(createTimelineEmptyDay());
    }
    else{
        for (const order of day.orders){
            if (order.stat & StateOrder.WAIT)continue
            list.appendChild(await createScheduleCard(order));
        }
    }

    section.append(separator, list);
    return section;
}

function appendScheduleMeta(parent, iconClass, text){
    if (!text)return;

    const item = document.createElement("span");
    const iconEl = document.createElement("i");
    const textEl = document.createElement("span");

    iconEl.className = iconClass;
    textEl.textContent = text;
    item.append(iconEl, textEl);
    parent.appendChild(item);
}


function isClientDateOrderInRangeHour(date) {
    const now = Date.now();
    const start = new Date(date).getTime();
    const end = start + (60 * 60 * 1000); // +1 hour

    return now >= start && now <= end;
}


async function createScheduleCard(order) {
    // const title = document.createElement("span")
    // title.className = 'schedule-card-title'
    // title.textContent = getOrderStatText(order.stat)


    const wrapper = document.createElement("div");
    wrapper.className = "schedule-card-item";

    const timeEl = document.createElement("div");
    timeEl.className = "schedule-time";
    timeEl.textContent = dateFloatToHour(order.date);

    const card = document.createElement("div");
    card.className = `schedule-card schedule-${getScheduleStatusName(order.stat)}`;

    const header = document.createElement("div");
    header.className = "schedule-card-header";

    const info = document.createElement("div");
    info.className = "sch-info";

    const name = document.createElement("span");
    name.className = "schedule-client-name";
    name.textContent = order.fullname;

    const meta = document.createElement("div");
    meta.className = "schedule-card-meta";
    appendScheduleMeta(meta, "fa-solid fa-phone", order.phone);
    appendScheduleMeta(meta, "fa-solid fa-location-dot", order.address);
    if (order.date_done != 0){
        appendScheduleMeta(meta, "fa-solid fa-clipboard-check", `הושלם ב-${dateFloatToHour(order.date_done)} ${dateFloatToYMD(order.date_done)}`)
    }

    info.append(name, meta);

    const _icon = document.createElement("i");
    _icon.className = "icon icon-32" + ((order.stat&StateOrder.CLOSED)&&isClientDateOrderInRangeHour(order.date)?" loading":"");
    
    _icon.innerHTML = await icon(getScheduleIconStatus(order));

    header.append(info, _icon);

    const money = document.createElement("div");
    money.className = "sch-money";

    const divPrice = document.createElement("div")
    const number = document.createElement("span");
    number.className = "shekel-number";
    number.textContent = order.price-order.off_price;

    const shekel = document.createElement("span");
    shekel.className = "shekel-icon";
    shekel.textContent = "₪";
    divPrice.append(number, shekel)

    const paidType = document.createElement("span");
    paidType.className = "payment-type";
    paidType.textContent = getPaymentStatText(order.payment_type);

    money.append(divPrice, paidType);

    // const client = document.createElement("div");
    // client.className = "schedule-client";
    // client.textContent = order.phone;

    card.append(header, money);
    wrapper.append(timeEl, card);

    return wrapper;
}

async function renderTimeLine(){

    const parent = document.getElementById("scsItems")
    parent.replaceChildren()
    const days = getTimelineOrders()
    hideTimelineEmpty()
    showTimeline()

    for (const day of days){
        parent.appendChild(await createTimelineDaySection(day))
    }

    parent.scrollTo({left: parent.scrollWidth, behavior: "smooth"});
}
