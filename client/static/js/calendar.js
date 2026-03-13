
/** @type {{id:string, name:string,date:string,lat:number,lng:number,stat:number, address:string},{[]}} */
var calendarClients = {}
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

function getClientCalendar(){
    var s = document.getElementById("calendar-from").dataset.s;
    var e = document.getElementById("calendar-to").dataset.e;
    if (!s||!e){
        var [s, e] = getCurrentMonthRange()
    }
    const [start, end] = [new Date(s), new Date(e)];
    return calendarClients[lastDateFetched]
        ?.filter(c => {
            const d = new Date(c.date)
            return (c.stat&c_runtime.state_calendar_selected) && (d >= start && d <= end)
        })||[]
}


function formatDate(d){
    const y = d.getFullYear()
    const m = String(d.getMonth()+1).padStart(2,'0')
    const day = String(d.getDate()).padStart(2,'0')
    return `${y}-${m}-${day}`
}

function getCurrentMonthRange(){
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth()+1, 1)
    return [formatDate(start),formatDate(end)]
}


function getColorByStat(stat){
    switch (stat){
        case StateClient.DONE:
            return "#046b09"
        case StateClient.CLOSED:
            return "#e8d400"
        case StateClient.CANCELED:
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

    getClientCalendar().forEach(c=>{
        marker = L.marker([c.lat,c.lng])
        .bindPopup(`
            <div class="client-popup">
                <div class="popup-header">
                    <div class="popup-title">
                        <div class="client-name">${c.name}</div>
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
    calendar.addEventSource(getClientCalendar().map(c=>({
            title:c.name,
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
            updateFromTo(info.startStr, info.endStr)
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
            fetchClientsCalendar();
        },
        dayMaxEvents: 2,
        events: getClientCalendar().map(c=>({
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
    dateFrom.dataset.s = s
    dateTo.dataset.e = e
    dateFrom.textContent = s.replace("-", ".").replace("-", ".")
    dateTo.textContent = e.replace("-", ".").replace("-", ".")
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
        month:calendar.getDate().getMonth()+1,
        year:calendar.getDate().getFullYear()
    }
    const newDateToFetch = data.year+data.month
    if (lastDateFetched in calendarClients){
        lastDateFetched = newDateToFetch;
        return
    }
    await apiPost(ApiRoute.api, data).then( res =>{
        if (!res.success){
            return;
        }
        lastDateFetched = newDateToFetch
        calendarClients[lastDateFetched] = res.data;
    })
    onSelectRangeCalendar();
}




document.addEventListener("DOMContentLoaded", function (){
    c_runtime.state_calendar_selected = StateClient.DONE|StateClient.CLOSED|StateClient.CANCELED
    initialMapClients()
    initialCalendarClients()
    fetchClientsCalendar()
    const [s,e] = getCurrentMonthRange()
    calendar.select(s,e)
    const observer = new ResizeObserver(()=>{

        mapClients?.invalidateSize()
        calendar?.updateSize()

    })

    observer.observe(document.querySelector(".dispatch-layout"))
})
