import {
    marketplaceEvents,
    marketplaceJobs,
    marketplaceInsights,
    networkPulse,
    marketplacePartners,
    marketplaceStats
} from "./mock-data.js";
import { marketplaceTabs, renderMarketplaceTabs } from "./components/MarketplaceTabs.js";
import { renderMarketplaceStats } from "./components/MarketplaceStats.js";
import { renderLiveHeader } from "./components/LiveHeader.js";
import { renderNetworkPulse } from "./components/NetworkPulse.js";
import { renderNetworkTrustStrip } from "./components/NetworkTrustStrip.js";
import { renderJobFilters } from "./components/JobFilters.js";
import { renderJobList } from "./components/JobList.js";
import { bindJobCardActions } from "./components/JobCard.js";
import { renderActivityFeed, renderEventReadyStates } from "./components/ActivityFeed.js";
import { renderPartnerCard } from "./components/PartnerCard.js";
import { renderPartnersDirectory } from "./components/PartnersDirectory.js";
import { renderMarketInsights } from "./components/MarketInsights.js";
import { renderJobDetailsModal, bindJobDetailsModal } from "./components/JobDetailsModal.js";

const defaultFilters = {
    search: "",
    serviceCategory: "all",
    location: "",
    maxDistanceKm: "all",
    date: "",
    minPrice: null,
    maxPrice: null
};

function matchesFilters(job, filters) {
    const query = filters.search.trim().toLowerCase();
    const inSearch = !query || [
        job.title,
        job.serviceName || "",
        job.location,
        job.businessName,
        job.postedBy,
        job.manager?.businessName || "",
        job.manager?.name || "",
        job.manager?.phone || ""
    ].some((value) => value.toLowerCase().includes(query));

    const inCategory = filters.serviceCategory === "all" || job.serviceType === filters.serviceCategory;
    const inLocation = !filters.location || job.location.includes(filters.location);
    const inDistance = filters.maxDistanceKm === "all" || job.distanceKm <= filters.maxDistanceKm;
    const inDate = !filters.date || job.date === filters.date;
    const inMinPrice = filters.minPrice === null || job.priceEstimate >= filters.minPrice;
    const inMaxPrice = filters.maxPrice === null || job.priceEstimate <= filters.maxPrice;

    return inSearch && inCategory && inLocation && inDistance && inDate && inMinPrice && inMaxPrice;
}

class MarketplacePage {
    constructor(root) {
        this.root = root;
        this.state = {
            jobs: marketplaceJobs,
            partners: marketplacePartners,
            events: marketplaceEvents,
            insights: marketplaceInsights,
            pulse: networkPulse,
            stats: { ...marketplaceStats },
            filters: { ...defaultFilters },
            activeTab: marketplaceTabs.MARKETPLACE,
            selectedJobId: null
        };

        this.actions = {
            onOpenDetails: (jobId) => {
                this.state.selectedJobId = jobId;
                this.render();
            },
            onCloseDetails: () => {
                this.state.selectedJobId = null;
                this.render();
            },
            onRequestJob: (jobId) => {
                this.state.jobs = this.state.jobs.map((job) =>
                    job.id === jobId
                        ? { ...job, status: "requested", requests: job.requests + 1, lastActivity: "עכשיו", pulse: "hot" }
                        : job
                );
                this.state.selectedJobId = null;
                this.render();
            },
            onSaveJob: (jobId) => {
                this.state.jobs = this.state.jobs.map((job) =>
                    job.id === jobId
                        ? { ...job, status: "saved", watchers: job.watchers + 1, lastActivity: "עכשיו", pulse: "watching" }
                        : job
                );
                this.render();
            },
            onViewManager: (jobId) => {
                this.state.selectedJobId = jobId;
                this.render();
            },
            onContactManager: (jobId) => {
                const job = this.state.jobs.find((item) => item.id === jobId);
                if (!job || !job.manager) return;
                window.location.href = `tel:${job.manager.phone.replace(/[^0-9]/g, "")}`;
            }
        };
    }

    render(activeFilter) {
        const filteredJobs = this.state.jobs.filter((job) => matchesFilters(job, this.state.filters));
        const selectedJob = this.state.jobs.find((job) => job.id === this.state.selectedJobId) || null;

        this.root.innerHTML = `
            ${renderMarketplaceTabs(this.state.activeTab)}
            ${renderNetworkTrustStrip(this.state.partners)}
            ${this.renderActiveTab(filteredJobs)}

            ${renderJobDetailsModal(selectedJob)}
        `;

        this.bindEvents();
        this.restoreFilterFocus(activeFilter);
    }

    renderActiveTab(filteredJobs) {
        if (this.state.activeTab === marketplaceTabs.PARTNERS) {
            return renderPartnersDirectory(this.state.partners);
        }

        if (this.state.activeTab === marketplaceTabs.INSIGHTS) {
            return renderMarketInsights(this.state.insights);
        }

        return `
            ${renderLiveHeader(this.state)}

            <section class="marketplace-section">
                ${renderMarketplaceStats(this.state.stats)}
            </section>

            ${renderNetworkPulse(this.state.pulse)}

            <div class="marketplace-live-grid">
                <section class="marketplace-section">
                    <div class="marketplace-section-head">
                        <h3>הזדמנויות לשיתוף פעולה</h3>
                        <span class="marketplace-section-subtitle">${filteredJobs.length} הזדמנויות פעילות בין עסקים מאומתים</span>
                    </div>
                    ${renderJobFilters(this.state.filters)}
                    ${renderJobList(filteredJobs)}
                </section>

                <aside class="marketplace-section marketplace-live-sidebar">
                    <div class="marketplace-section-head">
                        <h3>עדכוני רשת עסקיים</h3>
                        <span class="marketplace-section-subtitle">פעילות מקצועית של עסקים, עבודות ושיתופי פעולה</span>
                    </div>
                    ${renderActivityFeed(this.state.events)}

                    <div class="marketplace-section-head">
                        <h3>אותות רשת חיים</h3>
                    </div>
                    ${renderEventReadyStates()}
                </aside>
            </div>

            <section class="marketplace-section">
                <div class="marketplace-section-head">
                    <h3>עסקים מאומתים ברשת</h3>
                    <span class="marketplace-section-subtitle">בעלי עסקים פעילים שמייצרים אמון, זמינות ושיתופי פעולה</span>
                </div>
                <div class="marketplace-partners">
                    ${this.state.partners.map(renderPartnerCard).join("")}
                </div>
            </section>
        `;
    }

    bindEvents() {
        this.root.querySelectorAll("[data-marketplace-tab]").forEach((tab) => {
            tab.addEventListener("click", () => {
                this.state.activeTab = tab.dataset.marketplaceTab;
                this.state.selectedJobId = null;
                this.render();
            });
        });

        this.root.querySelectorAll("[data-marketplace-filter]").forEach((input) => {
            input.addEventListener("change", () => this.handleFilterInput(input));
            input.addEventListener("input", () => this.handleFilterInput(input));
        });

        bindJobCardActions(this.root, this.actions);
        bindJobDetailsModal(this.root, this.actions);
    }

    handleFilterInput(input) {
        const key = input.dataset.marketplaceFilter;
        if (!key) return;

        if (key === "maxDistanceKm") {
            this.updateFilters({ maxDistanceKm: input.value === "all" ? "all" : Number(input.value) }, key);
            return;
        }

        if (key === "minPrice" || key === "maxPrice") {
            this.updateFilters({ [key]: input.value === "" ? null : Number(input.value) }, key);
            return;
        }

        this.updateFilters({ [key]: input.value }, key);
    }

    updateFilters(filters, activeFilter) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.render(activeFilter);
    }

    updateStats(nextStats) {
        this.state.stats = { ...this.state.stats, ...nextStats };
        this.render();
    }

    restoreFilterFocus(activeFilter) {
        if (!activeFilter) return;

        const input = this.root.querySelector(`[data-marketplace-filter="${activeFilter}"]`);
        if (!input) return;

        input.focus();

        if (input instanceof HTMLInputElement && ["text", "search", "tel", "url", "password"].includes(input.type)) {
            const cursorPosition = input.value.length;
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
    }
}

export function mountMarketplace(root) {
    const page = new MarketplacePage(root);
    page.render();
    window.marketplacePage = page;
    return page;
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-marketplace-root]");
    if (root) mountMarketplace(root);
});
