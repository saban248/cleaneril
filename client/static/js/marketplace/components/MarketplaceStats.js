const statItems = [
    { key: "activeJobs", label: "active jobs", icon: "fa-solid fa-briefcase" },
    { key: "jobsExchangedToday", label: "jobs exchanged today", icon: "fa-solid fa-right-left" },
    { key: "verifiedManagersOnline", label: "verified managers", icon: "fa-solid fa-user-check" },
    { key: "nearbyOpportunities", label: "opportunities nearby", icon: "fa-solid fa-location-dot" }
];

export function renderMarketplaceStats(stats) {
    return `
        <div class="marketplace-stats">
            ${statItems.map((item) => `
                <div class="marketplace-stat-card">
                    <i class="${item.icon}"></i>
                    <div class="marketplace-stat-content">
                        <span class="marketplace-stat-value" data-marketplace-stat="${item.key}">${stats[item.key]}</span>
                        <span class="marketplace-stat-label">${item.label}</span>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}
