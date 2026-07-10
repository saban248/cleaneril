export function renderLiveHeader(state) {
    return `
        <section class="marketplace-live-header">
            <div>
                <div class="marketplace-live-title">
                    <span class="marketplace-live-dot"></span>
                    <span>רשת פעילה עכשיו</span>
                </div>
                <p>
                    עבודות, בקשות ומנהלים מאומתים מופיעים כאן כזרם פעילות. בהמשך הממשק הזה יתחבר לאירועי שרת או WebSocket.
                </p>
            </div>
            <div class="marketplace-live-metrics">
                <span><strong>${state.jobs.filter((job) => ["new", "waiting", "requested"].includes(job.status)).length}</strong> פתוחות</span>
                <span><strong>${state.jobs.reduce((sum, job) => sum + job.requests, 0)}</strong> בקשות</span>
                <span><strong>${state.partners.filter((partner) => partner.online).length}</strong> אונליין</span>
            </div>
        </section>
    `;
}
