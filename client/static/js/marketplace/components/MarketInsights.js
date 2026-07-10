function formatCurrency(value) {
    return `${value.toLocaleString("he-IL")} ₪`;
}

function demandIcon(direction) {
    if (direction === "hot") return "🔥";
    if (direction === "up") return "⬆";
    if (direction === "down") return "⬇";
    return "➡";
}

export function renderMarketInsights(insights) {
    const maxTrend = Math.max(...insights.priceTrends.map((item) => item.average));
    const activityItems = [
        ["Jobs posted today", insights.activity.jobsPostedToday],
        ["Jobs accepted today", insights.activity.jobsAcceptedToday],
        ["Average response time", insights.activity.averageResponseTime],
        ["Average accepted price", formatCurrency(insights.activity.averageAcceptedPrice)],
        ["Most popular service", insights.activity.mostPopularService],
        ["Most competitive city", insights.activity.mostCompetitiveCity]
    ];

    return `
        <section class="marketplace-section">
            <div class="marketplace-section-head">
                <h3>Market Insights</h3>
                <span class="marketplace-section-subtitle">Mock analytics data, ready for future APIs</span>
            </div>

            <div class="marketplace-insights-grid">
                <div class="marketplace-insight-panel marketplace-insight-wide">
                    <h4>Average prices by service</h4>
                    <div class="marketplace-price-list">
                        ${insights.averagePrices.map((item) => `
                            <div class="marketplace-price-row">
                                <span>${item.service}</span>
                                <strong>${formatCurrency(item.average)}</strong>
                                <small>${item.trend}</small>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="marketplace-insight-panel">
                    <h4>Market Demand</h4>
                    <div class="marketplace-demand-list">
                        ${insights.demand.map((item) => `
                            <div class="marketplace-demand-row marketplace-demand-${item.direction}">
                                <span>${demandIcon(item.direction)} ${item.label}</span>
                                <strong>${item.service}</strong>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="marketplace-insight-panel marketplace-insight-wide">
                    <h4>Price Trends</h4>
                    <div class="marketplace-chart-bars">
                        ${insights.priceTrends.map((item) => `
                            <div class="marketplace-chart-column">
                                <div class="marketplace-chart-bar" style="height:${Math.max(24, (item.average / maxTrend) * 120)}px"></div>
                                <span>${item.month}</span>
                                <small>${formatCurrency(item.average)}</small>
                            </div>
                        `).join("")}
                    </div>
                    <div class="marketplace-trend-note">
                        <span><i class="fa-solid fa-chart-line"></i> Average price over time</span>
                        <span><i class="fa-solid fa-arrow-trend-up"></i> Seasonal demand rises toward summer</span>
                    </div>
                </div>

                <div class="marketplace-insight-panel">
                    <h4>Regional Pricing</h4>
                    <div class="marketplace-region-list">
                        ${insights.regions.map((region) => `
                            <div class="marketplace-region-row">
                                <span>${region.city}</span>
                                <small>Average Sofa</small>
                                <strong>${formatCurrency(region.sofaAverage)}</strong>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="marketplace-insight-panel marketplace-insight-wide">
                    <h4>Marketplace Activity</h4>
                    <div class="marketplace-activity-metrics">
                        ${activityItems.map(([label, value]) => `
                            <div class="marketplace-activity-metric">
                                <span>${label}</span>
                                <strong>${value}</strong>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        </section>
    `;
}
