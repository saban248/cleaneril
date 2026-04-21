
let currentDate = new Date();
let selectedFrom = null;
let selectedTo = null;
let selectingMode = 'from'; // 'from' or 'to'
let dateMaximum = false;
let dateYear = false;

const reportsTabs  = {
    FUNDS:1<<0,
    ORDERS:1<<1
}
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


function showCalendarReports(){
    renderCalendar()
    const calendar = document.getElementById("reportsCalendar")
    calendar.classList.add("show")
}

function hideCalendarReports(){
    const calendar = document.getElementById("reportsCalendar")
    calendar.classList.remove("show")
}
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    let calendarHTML = '';
    
    // Day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="day-header">${day}</div>`;
    });
    
    // Previous month days
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        calendarHTML += `<div class="day other-month">${prevLastDate - i}</div>`;
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= lastDate; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = (selectedFrom && date.toDateString() === selectedFrom.toDateString()) ||
                            (selectedTo && date.toDateString() === selectedTo.toDateString());
        const isInRange = selectedFrom && selectedTo && date > selectedFrom && date < selectedTo;
        const isRangeStart = selectedFrom && date.toDateString() === selectedFrom.toDateString();
        const isRangeEnd = selectedTo && date.toDateString() === selectedTo.toDateString();
        
        let classes = 'day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (isInRange) classes += ' in-range';
        if (isRangeStart) classes += ' range-start';
        if (isRangeEnd) classes += ' range-end';
        
        calendarHTML += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${day})">${day}</div>`;
    }
    
    // Next month days
    const remainingDays = 42 - (firstDayWeek + lastDate);
    for (let i = 1; i <= remainingDays; i++) {
        calendarHTML += `<div class="day other-month">${i}</div>`;
    }
    
    document.getElementById('reports-calendar').innerHTML = calendarHTML;
}

function selectDate(year, month, day) {
    const date = new Date(year, month, day);    
    if (selectingMode === 'from' || !selectedFrom) {
        selectedFrom = date;
        selectedTo = null;
        selectingMode = 'to';
    } else if (selectingMode === 'to') {
        if (date < selectedFrom) {
            selectedTo = selectedFrom;
            selectedFrom = date;
        } else {
            selectedTo = date;
        }
        selectingMode = 'from';
    }
    
    updateDateDisplay();
    renderCalendar();
}

function updateDateDisplay() {
    const fromElement = document.getElementById('fromDate');
    const toElement = document.getElementById('toDate');
    const viewCalendarDate = document.getElementById("calendarDateview")
    
    if (selectedFrom) {
        fromElement.textContent = formatDate(selectedFrom);
    } else {
        fromElement.textContent = 'לא הוגדר';
    }
    
    if (selectedTo) {
        toElement.textContent = formatDate(selectedTo);
    } else {
        toElement.textContent = 'לא הוגדר';
    }
    if (!dateMaximum){
        viewCalendarDate.textContent = formatDate(selectedTo) + ' ל '+formatDate(selectedFrom)
    }
    else{
        viewCalendarDate.textContent = 'תמיד'
    }
}

function formatDate(date) {
    if (!date)return
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function goToMonth(year, month) {
    const now = new Date();

    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth(); // 0–11

    selectedFrom = new Date(y, m, 1);
    selectedTo   = new Date(y, m + 1, 0, 23, 59, 59, 999);
}

function goToYear(year) {
    dateMaximum = false
    dateYear = true
    const now = new Date();
    const y = year || now.getFullYear();
    selectedFrom = new Date(y, 0, 1);
    selectedTo   = new Date(y, 11, 31, 23, 59, 59, 999);
    updateDateDisplay()
    renderCalendar()

}

function goToMaximum(){
    dateMaximum = true;
    dateYear = false
}


function applyDates() {
    if (selectedFrom && selectedTo) {
        const days = Math.ceil((selectedTo - selectedFrom) / (1000 * 60 * 60 * 24));
        hideCalendarReports()
    } else {
        showToast("בחר התחלה וסיום", ToastStat.ERROR)
    }
}

async function animateCounter(el, target, icon, duration = 1000) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const value = Math.floor(progress * (target - start) + start);
        el.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
        if (progress == 1){
            el.textContent = icon + el.textContent
        }
    }
    requestAnimationFrame(update);
}


async function reloadReports(){
    await fetchFunds()
    showToast("עודכן", ToastStat.DONE)

}

async function fetchFunds(){
    function updateUI(id, value, icon = '₪') {
        const el = document.getElementById(id);
        el.innerText = formatNumber(value) + ` ${icon}`;
        animateCounter(el, value, icon)
    }
    const fti = "fundsTotalIncome";
    const fi = "fundsIncome";
    const fe = "fundsExpense";
    const fppc = "fundsPPC";
    const fepc = "fundsEPC";
    const toast = showToast("מעבד..")
    data = {action:ApiCall.funds_income, year:2026}
    return await new Promise((reslove) => apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR,toast);
                return;
            }
            // const {monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM} = prepareMonthlyData(res.data, year);
            
            // updateChartClientIncome(monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM)
            const {monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM} = prepareMonthlyData(res.data, 2026);
            updateChartClientIncome(monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM)
            updateUI(fti, res.in, '')
            updateUI(fe, res.ex)
            updateUI(fi, res.pr)
            updateUI(fppc, res.ave_ipc_ever)
            updateUI(fepc, res.ave_epc_ever)
            // setTotalDoneClient(res.total_client)
            closeToast(toast)
            reslove();

    }))
}

function moveIndicatorReportsTabs(el){
    const indicator = document.getElementById("rt-indicator");
    const parent = el.parentElement;
    const elRect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const left = elRect.left - parentRect.left;
    const width = elRect.width;

    indicator.style.transform = `translateX(${left-7}px)`;
    indicator.style.width = `${width}px`;
}
function switchReportsTab(tab){
    const funds = document.getElementById("reportsFunds");
    const orders = document.getElementById("reportsOrders")
    switch (tab){
        case reportsTabs.FUNDS:
            funds.classList.add("show")
            orders.classList.remove("show")
            break
        case reportsTabs.ORDERS:
            orders.classList.add("show")
            funds.classList.remove("show")
            break
    }
}


document.addEventListener("DOMContentLoaded", function () {
    goToMonth()
    renderCalendar();
    updateDateDisplay();
    fetchFunds()
    switchReportsTab(reportsTabs.FUNDS)

    document.addEventListener("click", e => {
    const calendar = document.getElementById("reportsCalendar")
    if (!calendar.contains(e.target) && !e.target.closest(".calendar-container") && !e.target.classList.contains("btn-r-show-calendar")&& !e.target.closest(".day")) {
        hideCalendarReports()
    }})

    const tabs = document.querySelectorAll(".reports-tab");
    tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelector(".reports-tab.selected")?.classList.remove("selected");
        tab.classList.add("selected");

        moveIndicatorReportsTabs(tab);
    })});


}
)




