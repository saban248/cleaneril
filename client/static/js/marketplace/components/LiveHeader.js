export function renderLiveHeader(state) {
    return `
        <section class="marketplace-live-header">
            <div>
                <span class="marketplace-network-eyebrow">Network Operations Center</span>
                <div class="marketplace-live-title">
                    <span class="marketplace-live-dot"></span>
                    <span>רשת בעלי העסקים פעילה עכשיו</span>
                </div>
                <p>
                    כמו מרכז עבודה מקצועי לענף הניקיון: עסקים מאומתים משתפים פעולה, מעבירים עבודות ומגיבים להזדמנויות בזמן אמת.
                </p>
            </div>
            <div class="marketplace-live-metrics">
                <span><strong>${state.jobs.filter((job) => ["new", "waiting", "requested"].includes(job.status)).length}</strong> הזדמנויות פתוחות</span>
                <span><strong>${state.jobs.reduce((sum, job) => sum + job.requests, 0)}</strong> בקשות שיתוף</span>
                <span><strong>${state.partners.filter((partner) => partner.online).length}</strong> עסקים זמינים</span>
            </div>
        </section>
    `;
}
