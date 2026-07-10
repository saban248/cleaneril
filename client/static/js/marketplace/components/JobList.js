import { renderJobCard } from "./JobCard.js";

export function renderJobList(jobs) {
    if (!jobs.length) {
        return `
            <div class="cleaneril-list marketplace-list icon-empty-list">
                <span>אין עבודות מתאימות לסינון הנוכחי</span>
            </div>
        `;
    }

    return `
        <div class="cleaneril-list marketplace-list">
            ${jobs.map(renderJobCard).join("")}
        </div>
    `;
}
