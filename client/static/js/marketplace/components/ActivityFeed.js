import { eventLabels } from "../mock-data.js";

export function renderActivityFeed(events) {
    return `
        <div class="marketplace-activity-feed">
            ${events.map((event) => `
                <div class="marketplace-activity-item" data-marketplace-event="${event.type}" ${event.targetJobId ? `data-job-id="${event.targetJobId}"` : ""}>
                    <div class="marketplace-activity-icon">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <div>
                        <strong>${event.title}</strong>
                        <span>${event.text}</span>
                        <small>${eventLabels[event.type]} · ${event.time}</small>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

export function renderEventReadyStates() {
    const states = [
        ["job_created", "עבודה חדשה", "תתווסף לראש הרשימה ותופיע בפיד"],
        ["job_taken", "עבודה נלקחה", "הסטטוס יעודכן והפעילות תירשם"],
        ["job_expired", "פג תוקף", "העבודה תסומן כפגה או תוסתר"],
        ["job_updated", "עודכן", "כרטיס העבודה יקבל סימון פעילות"],
        ["manager_joined", "מנהל הצטרף", "שותף חדש יופיע באזור הקהילה"]
    ];

    return `
        <div class="marketplace-event-states">
            ${states.map(([type, title, text]) => `
                <div class="marketplace-event-state" data-marketplace-event-state="${type}">
                    <strong>${title}</strong>
                    <span>${text}</span>
                </div>
            `).join("")}
        </div>
    `;
}
