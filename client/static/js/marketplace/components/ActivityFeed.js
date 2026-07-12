import { eventLabels } from "../protocol.js";

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
        ["job_created", "הזדמנות חדשה", "תופיע באזור ההזדמנויות ותסמן פעילות עסקית חדשה"],
        ["job_taken", "שיתוף פעולה נסגר", "הסטטוס יעודכן ויוצג כאמון בין עסקים"],
        ["job_expired", "חלון זמינות נסגר", "ההזדמנות תסומן כפחות רלוונטית"],
        ["job_updated", "פרטי הזדמנות עודכנו", "הכרטיס יקבל סימון פעילות מקצועית"],
        ["manager_joined", "עסק מאומת הצטרף", "חבר רשת חדש יופיע בספריית העסקים"]
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
