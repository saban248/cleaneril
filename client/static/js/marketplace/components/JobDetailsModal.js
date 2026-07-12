import { serviceCategoryLabels } from "../protocol.js";

function formatCurrency(value) {
    return `${value.toLocaleString("he-IL")} ₪`;
}

export function renderJobDetailsModal(job) {
    if (!job) {
        return `<div class="marketplace-details-modal" data-marketplace-details-modal></div>`;
    }

    return `
        <div class="marketplace-details-modal show" data-marketplace-details-modal>
            <div class="marketplace-details-box">
                <div class="marketplace-details-head">
                    <h3>${job.title}</h3>
                    <i class="fa-solid fa-circle-xmark" data-marketplace-modal-close></i>
                </div>
                <div class="marketplace-details-body">
                    <div class="marketplace-detail-grid">
                        <div class="marketplace-detail-item">
                            <span class="marketplace-detail-label">שירות</span>
                            <span class="marketplace-detail-value">${serviceCategoryLabels[job.serviceType]}</span>
                        </div>
                        <div class="marketplace-detail-item">
                            <span class="marketplace-detail-label">פעילות</span>
                            <span class="marketplace-detail-value">${job.watchers} צופים · ${job.requests} בקשות · ${job.lastActivity}</span>
                        </div>
                        <div class="marketplace-detail-item">
                            <span class="marketplace-detail-label">מיקום</span>
                            <span class="marketplace-detail-value">${job.location} · ${job.distanceKm} ק"מ</span>
                        </div>
                        <div class="marketplace-detail-item">
                            <span class="marketplace-detail-label">תאריך ומחיר</span>
                            <span class="marketplace-detail-value">${new Date(job.date).toLocaleDateString("he-IL")} · ${formatCurrency(job.priceEstimate)}</span>
                        </div>
                    </div>

                    <div class="marketplace-detail-section">
                        <h4>תיאור העבודה</h4>
                        <p>${job.description}</p>
                    </div>

                    <div class="marketplace-detail-section">
                        <h4>דרישות</h4>
                        <ul>${job.requirements.map((item) => `<li>${item}</li>`).join("")}</ul>
                    </div>

                    <div class="marketplace-detail-section">
                        <h4>תנאי העברה</h4>
                        <ul>${job.transferConditions.map((item) => `<li>${item}</li>`).join("")}</ul>
                    </div>

                    <div class="marketplace-detail-section">
                        <h4>תמונות</h4>
                        <div class="marketplace-image-placeholders">
                            ${Array.from({ length: job.imagePlaceholders }).map(() => `
                                <div class="marketplace-image-placeholder">
                                    <i class="fa-regular fa-image"></i>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="marketplace-details-actions">
                    <button class="btn cancel" type="button" data-marketplace-modal-close>סגור</button>
                    <button class="btn confirm" type="button" data-marketplace-action="request" data-job-id="${job.id}">בקש עבודה</button>
                </div>
            </div>
        </div>
    `;
}

export function bindJobDetailsModal(root, actions) {
    root.querySelectorAll("[data-marketplace-modal-close]").forEach((element) => {
        element.addEventListener("click", actions.onCloseDetails);
    });

    root.querySelectorAll("[data-marketplace-details-modal]").forEach((element) => {
        element.addEventListener("click", (event) => {
            if (event.target === element) actions.onCloseDetails();
        });
    });
}
