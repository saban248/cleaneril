
/** @type {{id:string, name:string,date:string,lat:number,lng:number,stat:number}[]} */
const calendarClients = [{
    id:1,
    name:"משה כהן",
    date:"2026-03-12",
    lat:32.18,
    lng:34.87,
    stat:1
}]
var mapClients = null;
/** @type {object[]} */
const markersClients = {}
var calendar = null;


function getColorByStat(stat){
    switch (stat){
        case StateClient.DONE:
            return "#046b09"
        case StateClient.WAIT:
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
    calendarClients.forEach(c=>{

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
        select:function(info){
            const from = info.startStr
            const to = info.endStr
        },
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
        events: calendarClients.map(c=>({
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
