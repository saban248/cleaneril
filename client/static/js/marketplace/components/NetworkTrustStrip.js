export function renderNetworkTrustStrip(partners) {
    return '';
    const verifiedPartners = partners.filter((partner) => partner.verified).slice(0, 3);

    return `
        <section class="marketplace-trust-strip">
            <div class="marketplace-trust-strip-head">
                <div>
                    <h3>Verified business owners are active here</h3>
                    <span>Trust, response quality and collaboration history are visible before every opportunity.</span>
                </div>
                <strong>${verifiedPartners.length} featured verified businesses</strong>
            </div>
            <div class="marketplace-trust-strip-grid">
                ${verifiedPartners.map((partner) => `
                    <div class="marketplace-trust-owner-card">
                        <div class="marketplace-partner-avatar">
                            <span class="marketplace-online-dot"></span>
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <div>
                            <div class="marketplace-partner-title">
                                <span>${partner.businessName}</span>
                                <span class="marketplace-verified"><i class="fa-solid fa-circle-check"></i> מאומת</span>
                            </div>
                            <small>${partner.managerName} · ${partner.city} · ${partner.availability}</small>
                            <div class="marketplace-trust-badges">
                                <span><i class="fa-solid fa-shield-halved"></i> Trust ${partner.trustScore}</span>
                                <span><i class="fa-solid fa-handshake"></i> ${partner.completedMarketplaceJobs} collaborations</span>
                                <span><i class="fa-regular fa-clock"></i> ${partner.responseTime}</span>
                                <span><i class="fa-solid fa-chart-line"></i> ${partner.successRate}</span>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}
