export const marketplaceTabs = {
    MARKETPLACE: 1<<0,
    PARTNERS: 1<<1,
    TRADES: 1<<2
};

export const networkModuleRegistry = [
    { key: marketplaceTabs.MARKETPLACE, label: "Marketplace", enabled: true },
    { key: marketplaceTabs.PARTNERS, label: "Business directory", enabled: true },
    { key: marketplaceTabs.TRADES, label: "Market analytics", enabled: true },
    { key: "live_activity", label: "Live activity", enabled: false },
    { key: "direct_messaging", label: "Direct messaging", enabled: false },
    { key: "partnership_requests", label: "Partnership requests", enabled: false },
    { key: "equipment_sharing", label: "Equipment sharing", enabled: false },
    { key: "supplier_directory", label: "Supplier directory", enabled: false },
    { key: "business_recommendations", label: "Business recommendations", enabled: false },
    { key: "community_discussions", label: "Community discussions", enabled: false },
    { key: "events_training", label: "Events and training", enabled: false },
    { key: "certifications", label: "Certifications", enabled: false },
    { key: "industry_news", label: "Industry news", enabled: false }
];

const tabItems = [
    { key: marketplaceTabs.MARKETPLACE, label: "שיתוף עבודות" },
    { key: marketplaceTabs.PARTNERS, label: "שותפים קרובים" },
    { key: marketplaceTabs.TRADES, label: "תנועות וסחר " }
];

export function renderMarketplaceTabs(activeTab) {
    
    return `
        <div class="reports-tabs marketplace-tabs">
            ${tabItems.map((tab) => `
                <span class="reports-tab marketplace-tab ${parseInt(activeTab) === tab.key ? "selected" : ""}" data-marketplace-tab="${tab.key}">
                    ${tab.label}
                </span>
            `).join("")}
        </div>
    `;
}
