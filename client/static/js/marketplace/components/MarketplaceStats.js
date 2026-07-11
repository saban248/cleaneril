const statItems = [
    { key: "jobsExchangedToday", label: "שיתופים היום", icon: "fa-solid fa-right-left", style:{color:'#32c3e3'}},
    { key: "verifiedManagersOnline", label: "לקוחות משותפים שהושלמו", icon: "fa-solid fa-handshake", style:{color:'#337249', background:null}},
    { key: "nearbyOpportunities", label: "שיתופים פתוחים", icon: "fa-solid fa-hand-fist", style:{color:'#6d21af'}}
];

export function renderMarketplaceStats(stats) {
    const jts = (so) => Object.entries(so)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`)
        .join('; ');
    return `
        <div class="marketplace-stats">
            ${statItems.map((item) => `
                <div class="marketplace-stat-card">
                    <i class="${item.icon}" style="${jts(item.style)}"></i>
                    <div class="marketplace-stat-content">
                        <span class="marketplace-stat-value" data-marketplace-stat="${item.key}">${stats[item.key]}</span>
                        <span class="marketplace-stat-label">${item.label}</span>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}
