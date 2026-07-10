import { serviceCategoryLabels, statusLabels } from "../mock-data.js";

function formatCurrency(value) {
    return `${value.toLocaleString("he-IL")} ₪`;
}

export function renderJobCard(job) {
    const manager = job.manager || {
        name: job.postedBy,
        businessName: job.businessName,
        phone: "-",
        verified: false,
        rating: "-",
        trustScore: "-",
        completedMarketplaceJobs: 0,
        availability: "",
        lastSeen: "",
        trustLabel: ""
    };

    return `
        <div class="client-item marketplace-job-card marketplace-pulse-${job.pulse}" data-marketplace-job-id="${job.id}">
            <div class="marketplace-job-main">
                <div>
                    <div class="marketplace-job-title">
                        <span class="marketplace-live-pin"></span>
                        <span>${job.serviceName || serviceCategoryLabels[job.serviceType]}</span>
                        <span class="marketplace-status marketplace-status-${job.status}">${statusLabels[job.status]}</span>
                    </div>
                    <div class="marketplace-job-subtitle">${job.title}</div>
                    <div class="marketplace-job-meta">
                        <span><i class="fa-solid fa-location-dot"></i>${job.location}</span>
                        <span><i class="fa-regular fa-clock"></i>${job.createdAgo}</span>
                        <span><i class="fa-solid fa-hourglass-half"></i>${job.availabilityWindow}</span>
                        <span><i class="fa-solid fa-route"></i>${job.distanceKm} ק"מ</span>
                    </div>
                    <div class="marketplace-job-value">
                        <span>שווי משוער</span>
                        <strong>${formatCurrency(job.priceEstimate)}</strong>
                    </div>
                    <div class="marketplace-job-manager">
                        <div class="marketplace-job-manager-avatar">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <div class="marketplace-job-manager-info">
                            <div>
                                <strong>${manager.businessName}</strong>
                                ${manager.verified ? `<span class="marketplace-verified"><i class="fa-solid fa-circle-check"></i> מאומת</span>` : ""}
                            </div>
                            <span>${manager.name} · ${manager.phone}</span>
                            <span><i class="fa-solid fa-star"></i> ${manager.rating} · ${manager.trustLabel}</span>
                            <div class="marketplace-trust-badges">
                                <span><i class="fa-solid fa-shield-halved"></i> Trust ${manager.trustScore}</span>
                                <span><i class="fa-solid fa-briefcase"></i> ${manager.completedMarketplaceJobs} network jobs</span>
                                <span><i class="fa-solid fa-chart-line"></i> ${manager.successRate}</span>
                                <span><i class="fa-solid fa-award"></i> ${manager.professionalLevel}</span>
                                <span><i class="fa-solid fa-face-smile"></i> ${manager.satisfactionScore}</span>
                                <span><i class="fa-regular fa-clock"></i> responds in ${manager.responseTime}</span>
                                <span><i class="fa-solid fa-signal"></i> ${manager.availability}</span>
                                <span><i class="fa-regular fa-clock"></i> ${manager.lastSeen}</span>
                            </div>
                        </div>
                    </div>
                    <div class="marketplace-job-live-row">
                        <span><i class="fa-regular fa-eye"></i>${job.watchers} צופים</span>
                        <span><i class="fa-regular fa-handshake"></i>${job.requests} בקשות</span>
                        <span><i class="fa-regular fa-clock"></i>${job.lastActivity}</span>
                    </div>
                </div>
                <div class="marketplace-job-actions">
                    <button class="marketplace-text-action" type="button" data-marketplace-action="request" data-job-id="${job.id}">בקש עבודה</button>
                    <button class="marketplace-text-action" type="button" data-marketplace-action="manager" data-job-id="${job.id}">צפה במנהל</button>
                    <button class="marketplace-text-action" type="button" data-marketplace-action="contact" data-job-id="${job.id}">צור קשר</button>
                    <i class="fa-solid fa-circle-info marketplace-icon-action" data-marketplace-action="details" data-job-id="${job.id}" title="פרטים"></i>
                </div>
            </div>
        </div>
    `;
}

export function bindJobCardActions(root, actions) {
    root.querySelectorAll("[data-marketplace-action]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.stopPropagation();
            const jobId = element.dataset.jobId;
            const action = element.dataset.marketplaceAction;
            if (!jobId) return;

            if (action === "details") actions.onOpenDetails(jobId);
            if (action === "request") actions.onRequestJob(jobId);
            if (action === "save") actions.onSaveJob(jobId);
            if (action === "manager") actions.onViewManager(jobId);
            if (action === "contact") actions.onContactManager(jobId);
        });
    });

    root.querySelectorAll("[data-marketplace-job-id]").forEach((element) => {
        element.addEventListener("click", () => {
            const jobId = element.dataset.marketplaceJobId;
            if (jobId) actions.onOpenDetails(jobId);
        });
    });
}
