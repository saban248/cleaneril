
/** @type {{id:string, name:string,date:string,lat:number,lng:number,stat:number}[]} */
const calendarClients = [{
    id:1,
    name:"משה כהן",
    date:"2026-03-12",
    lat:32.18,
    lng:34.87,
    stat:2
}]
var mapClients = null;
/** @type {object[]} */
const markersClients = {}
var calendar = null;


function getClientCalendar(){
    const startDate = document.getElementById("calendar-from").dataset.s;
    const endDate = document.getElementById("calendar-from").dataset.e;
    console.log(startDate, endDate)
    return calendarClients
        .filter(c => {
            const d = new Date(c.date)
            return (d >= startDate && d <= endDate) && c.state&c_runtime.state_calendar_selected
        })
        .sort((a,b)=>{
            return new Date(a.date) - new Date(b.date)
        })
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
    L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom:19
    }).addTo(mapClients)

    resetMarkersClients()
}


function resetMarkersClients(){
    getClientCalendar().forEach(c=>{

    const marker = L.marker([c.lat,c.lng])
        .addTo(mapClients)
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
            })

    markersClients[c.id] = marker
    })
}


function initialCalendarClients(){
    calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
        locale: "he",
        direction: "rtl",
        selectable:true,
        longPressDelay: 100,
        selectLongPressDelay: 100,
        select: function(info){
            updateFromTo(info.startStr, info.endStr)
            calendar.getEventById("selected-range")?.remove();
            calendar.addEvent({
                id: "selected-range",
                start: info.startStr,
                end: info.endStr,
                display: "background",
                backgroundColor: "#60a5fa"
            })},
        initialView: "dayGridMonth",
        headerToolbar:{
        start:'title',
        center:'',
        end:'today prev,next'
        },
        buttonText:{
            today:'היום'
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
            mapClients.setView(marker.getLatLng(), 11)
            marker.openPopup()

        }
    })
    calendar.render()
    const [s,e] = getCurrentMonthRange();
    updateFromTo(s, e)
}

function updateFromTo(s, e){
    const dateFrom = document.getElementById("calendar-from")
    const dateTo = document.getElementById("calendar-to")
    setSelectionRange(s, e);
    dateFrom.dataset.s = s
    dateTo.dataset.e = e
    dateFrom.textContent = s.replace("-", ".").replace("-", ".")
    dateTo.textContent = e.replace("-", ".").replace("-", ".")
}

function setSelectionRange(start, end){

    if(!start ||!end) return;
    const prev = calendar.getEventById("selected-range");
    if(prev) prev.remove();

    calendar.addEvent({
        id:"selected-range",
        start:start,
        end:end,
        display:"background",
        backgroundColor:"#60a5fa"
    });

}

function selectcalendarState(t){
    updateMenuActionCalendarSorted(t, t.dataset.s)
    initialCalendarClients();
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


function fetchClientsCalendar(){

}


document.addEventListener("DOMContentLoaded", function (){
    initialMapClients()
    initialCalendarClients()
    const observer = new ResizeObserver(()=>{

        mapClients?.invalidateSize()
        calendar?.updateSize()

    })

    observer.observe(document.querySelector(".dispatch-layout"))
})
