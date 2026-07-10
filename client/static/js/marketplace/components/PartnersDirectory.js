import { serviceCategoryLabels } from "../mock-data.js";

export function renderPartnersDirectory(partners) {
    return `
        <section class="marketplace-section">
            <div class="marketplace-section-head">
                <h3>ספריית עסקים מאומתים</h3>
                <span class="marketplace-section-subtitle">רשת מקצועית של בעלי עסקים לניקיון, שיתוף עבודות והיכרות עסקית</span>
            </div>
            <div class="marketplace-partner-directory">
                ${partners.map((partner) => `
                    <div class="marketplace-directory-card ${partner.online ? "marketplace-partner-online" : ""}">
                        <div class="marketplace-partner-avatar">
                            <span class="marketplace-online-dot"></span>
                            <i class="fa-solid fa-building"></i>
                        </div>
                        <div class="marketplace-directory-body">
                            <div class="marketplace-partner-title">
                                <span>${partner.businessName}</span>
                                ${partner.verified ? `<span class="marketplace-verified"><i class="fa-solid fa-circle-check"></i> מאומת</span>` : ""}
                            </div>
                            <div class="marketplace-directory-meta">
                                <span><i class="fa-solid fa-user-tie"></i>${partner.managerName}</span>
                                <span><i class="fa-solid fa-phone"></i>${partner.phone}</span>
                                <span><i class="fa-solid fa-location-dot"></i>${partner.city}</span>
                                <span><i class="fa-solid fa-star"></i>${partner.rating}</span>
                                <span><i class="fa-solid fa-shield-halved"></i>Trust ${partner.trustScore}</span>
                                <span><i class="fa-solid fa-circle-check"></i>${partner.completedMarketplaceJobs} שיתופי פעולה ברשת</span>
                                <span><i class="fa-solid fa-chart-line"></i>${partner.successRate} success</span>
                                <span><i class="fa-solid fa-award"></i>${partner.professionalLevel}</span>
                                <span><i class="fa-solid fa-face-smile"></i>${partner.satisfactionScore}</span>
                                <span><i class="fa-regular fa-clock"></i>Response ${partner.responseTime}</span>
                                <span><i class="fa-regular fa-calendar"></i>הצטרף ${partner.joinDate}</span>
                                <span><i class="fa-regular fa-clock"></i>${partner.lastSeen}</span>
                                <span><i class="fa-solid fa-signal"></i>${partner.availability}</span>
                            </div>
                            <div class="marketplace-partner-services">
                                ${partner.services.map((service) => `<span>${serviceCategoryLabels[service]}</span>`).join("")}
                            </div>
                            <div class="marketplace-directory-actions">
                                <button class="marketplace-text-action" type="button">הוסף למועדפים</button>
                                <button class="marketplace-text-action" type="button">הזמן לשיתוף</button>
                                <button class="marketplace-text-action" type="button">צ'אט</button>
                                <button class="marketplace-text-action" type="button">היסטוריה</button>
                                <button class="marketplace-text-action marketplace-muted-action" type="button">חסום</button>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}
