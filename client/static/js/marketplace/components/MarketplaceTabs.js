export const marketplaceTabs = {
    MARKETPLACE: "marketplace",
    PARTNERS: "partners",
    INSIGHTS: "insights"
};

const tabItems = [
    { key: marketplaceTabs.MARKETPLACE, label: "Marketplace" },
    { key: marketplaceTabs.PARTNERS, label: "Partners" },
    { key: marketplaceTabs.INSIGHTS, label: "Market Insights" }
];

export function renderMarketplaceTabs(activeTab) {
    return `
        <div class="reports-tabs marketplace-tabs">
            ${tabItems.map((tab) => `
                <span class="reports-tab marketplace-tab ${activeTab === tab.key ? "selected" : ""}" data-marketplace-tab="${tab.key}">
                    ${tab.label}
                </span>
            `).join("")}
        </div>
    `;
}
