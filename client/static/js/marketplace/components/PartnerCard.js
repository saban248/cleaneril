import { serviceCategoryLabels } from "../mock-data.js";

export function renderPartnerCard(partner) {
    return `
        <div class="marketplace-partner-card ${partner.online ? "marketplace-partner-online" : ""}">
            <div class="marketplace-partner-avatar">
                <span class="marketplace-online-dot"></span>
                <i class="fa-solid fa-building"></i>
            </div>
            <div class="marketplace-partner-body">
                <div class="marketplace-partner-title">
                    <span>${partner.businessName}</span>
                    ${partner.verified ? `<span class="marketplace-verified"><i class="fa-solid fa-circle-check"></i> מאומת</span>` : ""}
                </div>
                <div class="marketplace-partner-meta">
                    <span><i class="fa-solid fa-star"></i> ${partner.rating}</span>
                    <span><i class="fa-solid fa-shield-halved"></i> Trust ${partner.trustScore}</span>
                    <span><i class="fa-solid fa-circle-check"></i> ${partner.completedMarketplaceJobs} network jobs</span>
                    <span><i class="fa-solid fa-chart-line"></i> ${partner.successRate}</span>
                    <span><i class="fa-solid fa-award"></i> ${partner.professionalLevel}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${partner.location}</span>
                </div>
                <div class="marketplace-trust-badges">
                    <span><i class="fa-solid fa-face-smile"></i> ${partner.satisfactionScore}</span>
                    <span><i class="fa-regular fa-clock"></i> responds in ${partner.responseTime}</span>
                    <span><i class="fa-solid fa-signal"></i> ${partner.availability}</span>
                    <span><i class="fa-regular fa-clock"></i> ${partner.lastSeen}</span>
                </div>
                <div class="marketplace-partner-services">
                    ${partner.services.map((service) => `<span>${serviceCategoryLabels[service]}</span>`).join("")}
                </div>
                <div class="marketplace-partner-presence">${partner.statusText}</div>
            </div>
        </div>
    `;
}
