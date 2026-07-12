let liveNetworkMap = null;
let liveNetworkLayer = null;
let liveNetworkMarkersByJobId = {};

const serviceMarkerLabels = {
    upholstery: "S",
    airConditioner: "A",
    carpet: "C",
    general: "G",
    mattress: "M",
    leather: "L"
};

function getMapCounters(jobs) {
    const activeJobs = jobs.length;
    const newJobs = jobs.filter((job) => job.status === "New").length;
    const verifiedManagers = jobs.filter((job) => job.managerVerified).length;
    const serviceAreas = new Set(jobs.map((job) => job.clusterGroup || job.city)).size;

    return { activeJobs, newJobs, verifiedManagers, serviceAreas };
}

function getClusterGroups(jobs) {
    const groupedJobs = jobs.reduce((collection, job) => {
        const key = job.clusterGroup || job.id;
        if (!collection[key]) collection[key] = [];
        collection[key].push(job);
        return collection;
    }, {});

    return Object.values(groupedJobs).map((group) => {
        if (group.length < 3) {
            return group.map((job) => ({
                type: "single",
                jobs: [job],
                coordinates: job.approximateCoordinates
            }));
        }

        const coordinates = group.reduce((center, job) => {
            center[0] += job.approximateCoordinates[0];
            center[1] += job.approximateCoordinates[1];
            return center;
        }, [0, 0]);

        return [{
            type: "cluster",
            jobs: group,
            coordinates: [coordinates[0] / group.length, coordinates[1] / group.length]
        }];
    }).flat();
}

function createMarkerIcon(job) {
    const serviceType = job.serviceType || "general";
    const isFresh = job.status === "New";

    return L.divIcon({
        className: "marketplace-network-div-icon",
        html: `
            <span class="network-map-marker network-map-marker-${serviceType} ${isFresh ? "network-map-marker-pulse" : ""}">
                <span>${serviceMarkerLabels[serviceType] || "J"}</span>
            </span>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
    });
}

function createClusterIcon(count) {
    return L.divIcon({
        className: "marketplace-network-div-icon",
        html: `
            <span class="network-map-cluster">
                <strong>${count}</strong>
                <small>live</small>
            </span>
        `,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -22]
    });
}

function renderPopup(job) {
    return `
        <div class="network-map-popup">
            <div class="network-map-popup-header">
                <strong>${job.serviceName}</strong>
                <span>${job.status}</span>
            </div>
            <div class="network-map-popup-body">
                <span><i class="fa-solid fa-location-dot"></i>${job.city}</span>
                <span><i class="fa-solid fa-shekel-sign"></i>${job.value}</span>
                <span><i class="fa-regular fa-clock"></i>${job.publishedAgo}</span>
                <span><i class="fa-solid fa-hourglass-half"></i>${job.remainingAvailability}</span>
                <span><i class="fa-solid fa-building"></i>${job.manager} ${job.managerVerified ? "Verified" : ""}</span>
                <span><i class="fa-solid fa-phone"></i>${job.managerPhone}</span>
                <span><i class="fa-solid fa-shield-halved"></i>Trust ${job.trustScore}</span>
                <small>${job.activity} - approximate area only</small>
            </div>
            <div class="network-map-popup-actions">
                <button type="button" data-network-map-action="request" data-job-id="${job.id}" data-linked-job-id="${job.linkedJobId || ""}">Request Job</button>
                <button type="button" data-network-map-action="details" data-job-id="${job.id}" data-linked-job-id="${job.linkedJobId || ""}">View Details</button>
            </div>
        </div>
    `;
}

function renderClusterPopup(jobs) {
    const cities = [...new Set(jobs.map((job) => job.city))].slice(0, 3).join(" / ");

    return `
        <div class="network-map-popup network-map-cluster-popup">
            <div class="network-map-popup-header">
                <strong>${jobs.length} shared jobs</strong>
                <span>Live cluster</span>
            </div>
            <div class="network-map-popup-body">
                <span><i class="fa-solid fa-location-dot"></i>${cities}</span>
                <span><i class="fa-solid fa-user-shield"></i>${jobs.filter((job) => job.managerVerified).length} verified managers</span>
                <span><i class="fa-solid fa-bolt"></i>${jobs.filter((job) => job.status === "New").length} newly published</span>
                <small>Approximate regional view only. Exact customer details stay private.</small>
                <div class="network-map-cluster-list">
                    ${jobs.slice(0, 4).map((job) => `
                        <button type="button" data-network-map-action="details" data-job-id="${job.id}" data-linked-job-id="${job.linkedJobId || ""}">
                            <strong>${job.serviceName}</strong>
                            <span>${job.city} - ${job.value}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        </div>
    `;
}

export function renderLiveNetworkMap(jobs, mapExpanded = true) {
    const counters = getMapCounters(jobs);

    return `
        <section class="marketplace-section marketplace-map-section ${mapExpanded ? "" : "marketplace-map-section-collapsed"}">
            <div class="marketplace-section-head">
                <div>
                    <h3>מפת שיתוף בזמן אמת</h3>
                    <span class="marketplace-section-subtitle">
                        אזורי שירות משוערים בלבד. פרטי הלקוחות המדויקים נשמרים חסויים.
                    </span>
                </div>
                <span class="marketplace-map-sync-state">
                    ${jobs.length} מקומות פעילים 
                </span>
            </div>
            <button class="marketplace-map-mobile-toggle" type="button" data-marketplace-map-toggle aria-expanded="${mapExpanded ? "true" : "false"}">
                <span><i class="fa-solid fa-map-location-dot"></i>${mapExpanded ? "Hide live map" : "Show live map"}</span>
                <strong>${counters.activeJobs} active</strong>
            </button>
            <div class="marketplace-map-body">
                <div class="marketplace-map-counters">
                    <div>
                        <strong>${counters.activeJobs}</strong>
                        <span>עבודות פתוחות</span>
                    </div>
                    <div>
                        <strong>${counters.newJobs}</strong>
                        <span>נפתח עכשיו</span>
                    </div>
                    <div>
                        <strong>${counters.verifiedManagers}</strong>
                        <span>עסקים שונים</span>
                    </div>
                    <div>
                        <strong>${counters.serviceAreas}</strong>
                        <span>שיתוף שהושלם</span>
                    </div>
                </div>
                <div class="marketplace-map-layout">
                    <div class="marketplace-map-panel">
                        <div id="networkLiveMap"></div>
                    </div>
                    <div class="marketplace-map-list">
                        ${jobs.slice(0, 8).map((job) => `
                            <div class="marketplace-map-list-item" data-network-map-job="${job.id}">
                                <div class="marketplace-map-list-header">
                                    <img src="/static/images/logo/default_logo.png">
                                </div>
                                <div class="marketplace-map-list-content">
                                    <strong>${job.serviceName}</strong>
                                    <span>${job.areaLabel || job.city} - 
                                        <span>${job.value}</span> - 
                                        <span class='mmlc-activity'>${job.activity}</span>
                                    </span>
                                    <small>${job.manager} - Trust ${job.trustScore}</small>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        </section>
    `;
}

export function initLiveNetworkMap(jobs) {
    const container = document.getElementById("networkLiveMap");
    if (!container || typeof L === "undefined") return;

    if (liveNetworkMap) {
        liveNetworkMap.remove();
        liveNetworkMap = null;
        liveNetworkLayer = null;
    }

    liveNetworkMap = L.map("networkLiveMap").setView([31.95, 34.95], 8);
    liveNetworkLayer = L.layerGroup().addTo(liveNetworkMap);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20
    }).addTo(liveNetworkMap);

    renderMapMarkers(jobs);
    bindMapListItems(jobs);
    bindMapPopupActions(container);
    setInterval(() => liveNetworkMap?.invalidateSize(), 1500);
    
}

function renderMapMarkers(jobs) {
    if (!liveNetworkLayer) return;

    liveNetworkLayer.clearLayers();
    liveNetworkMarkersByJobId = {};
    jobs.forEach((job) => {
        console.log(job)
        const marker = L.marker(job.approximateCoordinates, {
            icon: createMarkerIcon(job)
        })
            .bindPopup(renderPopup(job), {
                className: "custom-popup marketplace-network-map-popup",
                closeButton: false,
                maxWidth: 210
            })
            .addTo(liveNetworkLayer);

        marker.on("mouseover", () => marker.openPopup());
        marker.on("click", () => marker.openPopup());

        liveNetworkMarkersByJobId[job.id] = marker;
    });
}

function bindMapListItems(jobs) {
    jobs.forEach((job) => {
        const listItem = document.querySelector(`[data-network-map-job="${job.id}"]`);
        const marker = liveNetworkMarkersByJobId[job.id];
        if (!listItem || !marker) return;

        listItem.addEventListener("mouseenter", () => marker.openPopup());
        listItem.addEventListener("click", () => {
            liveNetworkMap.setView(marker.getLatLng(), 9);
            marker.openPopup();
        });
    });
}

function bindMapPopupActions(container) {
    container.addEventListener("click", (event) => {
        const action = event.target.closest("[data-network-map-action]");
        if (!action) return;

        const jobId = action.dataset.jobId;
        const linkedJobId = action.dataset.linkedJobId;
        const actionType = action.dataset.networkMapAction;
        const customEvent = new CustomEvent("network-map-job-action", {
            bubbles: true,
            detail: { jobId, linkedJobId, action: actionType }
        });

        container.dispatchEvent(customEvent);
    });
}

export function updateLiveNetworkMap(jobs) {
    if (!liveNetworkMap || !liveNetworkLayer) return;

    renderMapMarkers(jobs);
    bindMapListItems(jobs);
    setTimeout(() => liveNetworkMap?.invalidateSize(), 80);
}
