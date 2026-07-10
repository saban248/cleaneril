import { serviceCategoryLabels } from "../mock-data.js";

const distanceOptions = [
    { value: "all", label: "הכל" },
    { value: "10", label: "עד 10 קמ" },
    { value: "20", label: "עד 20 קמ" },
    { value: "40", label: "עד 40 קמ" }
];

export function renderJobFilters(filters) {
    return `
        <div class="marketplace-actions">
            <div class="action-search marketplace-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input class="c-input-fn" type="text" placeholder="חיפוש לפי שירות, עיר או עסק" value="${filters.search}" data-marketplace-filter="search">
            </div>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-filter"></i> שירות</span>
                <select class="c-input-fn marketplace-filter-input" data-marketplace-filter="serviceCategory">
                    <option value="all"${filters.serviceCategory === "all" ? " selected" : ""}>הכל</option>
                    ${Object.keys(serviceCategoryLabels).map((value) => `
                        <option value="${value}"${filters.serviceCategory === value ? " selected" : ""}>${serviceCategoryLabels[value]}</option>
                    `).join("")}
                </select>
            </label>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-location-dot"></i> אזור</span>
                <input class="c-input-fn marketplace-filter-input" type="text" placeholder="עיר" value="${filters.location}" data-marketplace-filter="location">
            </label>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-route"></i> מרחק</span>
                <select class="c-input-fn marketplace-filter-input" data-marketplace-filter="maxDistanceKm">
                    ${distanceOptions.map((option) => `
                        <option value="${option.value}"${String(filters.maxDistanceKm) === option.value ? " selected" : ""}>${option.label}</option>
                    `).join("")}
                </select>
            </label>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-calendar-day"></i> תאריך</span>
                <input class="c-input-fn marketplace-filter-input" type="date" value="${filters.date}" data-marketplace-filter="date">
            </label>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-shekel-sign"></i> מחיר מ</span>
                <input class="c-input-fn marketplace-filter-input" type="number" min="0" value="${filters.minPrice || ""}" data-marketplace-filter="minPrice">
            </label>

            <label class="filter-item">
                <span class="filter-label"><i class="fa-solid fa-shekel-sign"></i> מחיר עד</span>
                <input class="c-input-fn marketplace-filter-input" type="number" min="0" value="${filters.maxPrice || ""}" data-marketplace-filter="maxPrice">
            </label>
        </div>
    `;
}
