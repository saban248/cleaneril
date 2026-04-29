
/** @type {{id:string, name:string,date:string,lat:number,lng:number,stat:number, address:string},{[]}} */
var calendarCacheOrders = {}
var mapClients = null;
/** @type {object[]} */
var markersClients = {}
var markerLayer = null;
var calendar = null;
let selectS = null
let selectE = null
let lastDateFetched = 0;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getOrdersCalendar(){
    var s = document.getElementById("calendar-from").dataset.s;
    var e = document.getElementById("calendar-to").dataset.e;
    if (!s||!e){
        var [s, e] = getCurrentMonthRange()
    }
    else{
        [s,e] = [new Date(s), new Date(e)]
    }
    return calendarCacheOrders[lastDateFetched]
        ?.filter(c => {
            const d = new Date(c.date*1000)
            return (c.stat&c_runtime.state_calendar_selected) && (d >= s && d <= e)
        })||[]
        
}


function formatDateCalendar(d){
    const y = d.getFullYear()
    const m = String(d.getMonth()+1).padStart(2,'0')
    const day = String(d.getDate()).padStart(2,'0')
    return `${y}-${m}-${day}`
}

function getCurrentMonthRange(){
    const now = new Date()
    return getMonthRange(now)
}

function getMonthRange(date) {

    const year = date.getFullYear();
    const month = date.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    return [start, end ];
}


function getColorByStat(stat){
    switch (stat){
        case StateOrder.DONE:
            return "#046b09"
        case StateOrder.CLOSED:
            return "#e8d400"
        case StateOrder.CANCELED:
            return "#b7b7b7"
    }

    return "#ffffff"
}



function initialMapClients(){
    mapClients = L.map("map").setView([31.7100077,35.478982],8)
    markerLayer = L.layerGroup().addTo(mapClients)
    L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom:20
    }).addTo(mapClients)

    resetMarkersClients()
}

 
function resetMarkersClients(){
    markerLayer.clearLayers()

    getOrdersCalendar().forEach(c=>{
        const coordinates = Array.isArray(c.coordinates) ? c.coordinates : JSON.parse(c.coordinates);
        if (!coordinates){return}
        marker = L.marker(coordinates)
        .bindPopup(`
            <div class="client-popup">
                <div class="popup-header">
                    <div class="popup-title">
                        <div class="client-name">${c.fullname}</div>
                        <div class="client-date">${c.date}</div>
                    </div>
                </div>
                <div class="popup-body">
                    <div class="popup-row">
                        <span class="popup-icon">📍</span>
                        <span>${c.address}</span>
                    </div>
                </div>
                <div class="popup-actions">
                    <button onclick="openClient(${c.id})">פתח לקוח</button>
                </div>
            </div>
            `,{
                className:"cool-popup",
                maxWidth:260
            }).addTo(markerLayer)
            

    markersClients[c.id] = marker
    })
    
    
}

function resetCalendarEvents(){
    calendar.removeAllEvents()
    calendar.addEventSource(getOrdersCalendar().map(c=>({
            title:c.fullname,
            start:c.date,
            id:c.id,
            backgroundColor:getColorByStat(c.stat),
            borderColor:getColorByStat(c.stat)
        })
    ))
}

function initialCalendarClients(initial = false){
    calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
        locale: "he",
        direction: "rtl",
        selectable:true,
        longPressDelay: 100,
        selectLongPressDelay: 100,
        select: function(info){
            fetchClientsCalendar()
            updateFromTo(new Date(info.startStr), new Date(info.endStr))
            onSelectRangeCalendar()
            calendar.getEventById("selected-range")?.remove();
            calendar.addEvent({
                id: "selected-range",
                start: info.startStr,
                end: info.endStr,
                display: "background",
                backgroundColor: "#d8e8fc"
            })},

        initialView: "dayGridMonth",
        headerToolbar:{
        start:'title',
        left: 'prev,next',      
        center: 'title',   
        right: 'dayGridMonth,timeGridWeek,dayGridDay' 
        },
        buttonText: {
            day: 'היום',
            month: 'החודש',
            week: 'השבוע',
        },
        datesSet: function(info){
            updateFromTo(...getMonthRange(info.start))
            fetchClientsCalendar();
        },
        dayMaxEvents: 2,
        events: getOrdersCalendar().map(c=>({
            title:c.name,
            start:c.date,
            id:c.id,
            backgroundColor:getColorByStat(c.stat),
            borderColor:getColorByStat(c.stat)
        })),

        eventClick: function(info){
            const id = info.event.id
            const marker = markersClients[id]
            if (marker==undefined)return
            mapClients.setView(marker.getLatLng(), 9)
            marker.openPopup()

        }
    })

    calendar.render()
}

function updateFromTo(s, e){
    const dateFrom = document.getElementById("calendar-from")
    const dateTo = document.getElementById("calendar-to")
    fs =formatDateCalendar(s)
    fe = formatDateCalendar(e)
    dateFrom.dataset.s = fs
    dateTo.dataset.e = fe
    dateFrom.textContent = fs.replace("-", ".").replace("-", ".")
    dateTo.textContent = fe.replace("-", ".").replace("-", ".")
    selectS = s
    selectE = e
}

function onSelectRangeCalendar(){
    resetMarkersClients()
    resetCalendarEvents()
   
}

function selectCalendarState(t){
    updateMenuActionCalendarSorted(t, t.dataset.s)
    onSelectRangeCalendar()
    calendar.select(selectS, selectE)
}

function updateMenuActionCalendarSorted(t, state, cache = true){
    const cSelected = "sc-selected"
    if (!t.classList.contains(cSelected)&& (!(state&c_runtime.state_calendar_selected) || !cache)){
        t.classList.add(cSelected)
        c_runtime.state_calendar_selected |= state
    }
    else{
        t.classList.remove(cSelected)
        c_runtime.state_calendar_selected &= ~state
    }
}


async function fetchClientsCalendar(){
    const data = {
        action:ApiCall.calendar,
        df:selectS.getTime()/1000,
        dt:selectE.getTime()/1000
    }
    const newDateToFetch = data.df
    if (lastDateFetched in calendarCacheOrders){
        lastDateFetched = newDateToFetch;
        return
    }
    await apiPost(ApiRoute.api, data).then( res =>{
        if (!res.success){
            return;
        }
        lastDateFetched = newDateToFetch
        calendarCacheOrders[lastDateFetched] = res.data;
    })
    onSelectRangeCalendar();
}




document.addEventListener("DOMContentLoaded", function (){
    c_runtime.state_calendar_selected = StateOrder.DONE|StateOrder.CLOSED|StateOrder.CANCELED
    const [s,e] = getCurrentMonthRange()
    updateFromTo(s, e)
    initialMapClients()
    initialCalendarClients()
    calendar.select(s,e)
    fetchClientsCalendar()

    const observer = new ResizeObserver(()=>{

        mapClients?.invalidateSize()
        calendar?.updateSize()

    })

    observer.observe(document.querySelector(".dispatch-layout"))
})
