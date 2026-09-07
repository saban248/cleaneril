const c_reports = {
    clientReportsTimeout: {},
}

function timeoutDeleteClientReports(clientId, sec=300){
    if (c_reports.clientReportsTimeout[clientId]){
        clearTimeout(c_reports.clientReportsTimeout[clientId]);
    }
    c_reports.clientReportsTimeout[clientId] = setTimeout(()=>{
        if (c_runtime.clientsReports[clientId]){
            delete c_runtime.clientsReports[clientId];
        }
    }, sec*1000)
}

async function fetchClientReports(clientId) {
    if (!clientId){
        clientId = c_runtime.currentClientIdView;
    }
    const data = {action:ApiCall.client_reports, client_id:clientId}
    const toast = showToast('מוריד...');
    await apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice,ToastStat.ERROR, toast);
                return
            }
            c_runtime.clientsReports[clientId] = res.reports;
            timeoutDeleteClientReports(clientId);
            closeToast(toast);
        }
    )
    
}


function reportEscapeHtml(value){
    return String(value ?? "").replace(/[&<>"']/g, function(char){
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        }[char];
    });
}

function reportMoney(value){
    const amount = Number(value || 0);
    return `${amount.toLocaleString("he-IL")}`;
}

function reportDate(value){
    if (!value){
        return "ללא תאריך";
    }
    return `${dateFloatToYMD(value)} ${dateFloatToHour(value)}`;
}

function getClientReportCoordinates(order){
    if (!order){
        return null;
    }

    let coordinates = order.coordinates || order.coordinate;
    if (!coordinates){
        return null;
    }

    if (typeof coordinates == "string"){
        try {
            coordinates = JSON.parse(coordinates);
        } catch (err) {
            return null;
        }
    }

    if (!Array.isArray(coordinates) || coordinates.length < 2){
        return null;
    }

    const lat = parseFloat(coordinates[0]);
    const lng = parseFloat(coordinates[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)){
        return null;
    }

    return [lat, lng];
}

async function renderClientReportProfileMap(order){
    const mapEl = document.getElementById("clientReportProfileMap");
    if (!mapEl || typeof L == "undefined"){
        return;
    }

    let coordinates = getClientReportCoordinates(order);
    if (!coordinates && order?.address){
        coordinates = await geocodeAddressOSM(order.address);
    }
    if (!coordinates){
        mapEl.classList.add("hide");
        return;
    }

    if (c_runtime.clientReportProfileMap){
        c_runtime.clientReportProfileMap.remove();
        c_runtime.clientReportProfileMap = null;
    }

    const map = L.map(mapEl, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        tap: true
    }).setView(coordinates, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20
    }).addTo(map);

    L.circleMarker(coordinates, {
        radius: 8,
        color: "#ffffff",
        weight: 3,
        fillColor: "#ef4444",
        fillOpacity: 1
    }).addTo(map);

    c_runtime.clientReportProfileMap = map;
    setTimeout(() => map.invalidateSize(), 1000);
}

function reportOrderTotal(order){
    if (!order){
        return 0;
    }

    if (order.items && Object.keys(order.items).length){
        let total = 0;
        for (const item of Object.values(order.items)){
            total += parseInt(item.price) || 0;
        }
        return Math.max(0, total - (parseInt(order.off_price) || 0));
    }

    return Math.max(0, (parseInt(order.price) || 0) - (parseInt(order.off_price) || 0));
}


function getClientReportOrders(){
    const primaryOrder = getClientReportPrimaryOrder();
    if (!primaryOrder){
        return [];
    }

    const primaryPhone = cleanPhoneJustNumbers(primaryOrder.phone || "");
    return c_runtime.orders.filter(function(order){
        const samePhone = primaryPhone && cleanPhoneJustNumbers(order.phone || "") == primaryPhone;
        const sameClient = c_runtime.currentClientIdView && order.client_id == c_runtime.currentClientIdView;
        return samePhone || sameClient;
    });
}

function getClientReportReceipts(orders){
    const orderIds = orders.map(order => String(order.order_id));
    return c_runtime.invoices.filter(function(receipt){
        return orderIds.includes(String(receipt.order_id)) && !receipt.is_credit;
    });
}


function buildClientReportEvents(orders, receipts){
    const orderEvents = orders.map(function(order){
        return {
            date: order.date,
            icon: getCleanOrderTypeIcon(order.order_type),
            title: `הזמנה ${order.key || order.order_id || ""}`,
            text: `${getOrderStatText(order.stat)} · ${order.fullname || ""}`,
            amount: reportOrderTotal(order),
            type: "order"
        };
    });

    const receiptEvents = receipts.map(function(receipt){
        const order = orders.find(item => item.order_id == receipt.order_id);
        return {
            date: receipt.date,
            icon: "fa-solid fa-file-invoice",
            title: `קבלה ${String(receipt.key || receipt.receipt_id || "").padStart(4, "0")}`,
            text: `${getInvoiceStatTypeText(receipt.stat) || "תשלום"} · ${order?.fullname || ""}`,
            amount: reportOrderTotal(order),
            type: "receipt"
        };
    });

    return orderEvents.concat(receiptEvents).sort(function(a, b){
        return (b.date || 0) - (a.date || 0);
    });
}

function renderClientHistory(histories){
    if (!histories.length){
        return `<div class="client-report-empty">אין אירועים להצגה</div>`
    }

    const Html = histories.slice(0, 5).map(function(event){
        const entityTitle = getClientHistoryEntityTitle(event.entity)
        const actionText = getClientHistoryActionText(event.action)
        const entityIcon = getClientHistoryEntityIcon(event.entity)
        const createdAt = new Date(event.created_at * 1000).toLocaleDateString("he-IL", {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

        });
        return `
            <div class="client-report-event client-report-event-${event.entity}">
                <div class="client-report-event-icon">
                    <i class="${entityIcon}"></i>
                </div>
                <div class="client-report-event-content">
                    <strong>${entityTitle} ${actionText}</strong>
                    <small>${createdAt}</small>
                    <span>${event.description?"שינויים: ":""}${event.description}</span>
                </div>
                <div class="client-report-event-amount">${reportMoney(event.amount)}</div>
            </div>
        `;
    }).join("");

    return Html
}
async function reloadClientSummaryReport(t){
    t.classList.add("spin")
    delete c_runtime.clientsReports[c_runtime.currentClientIdView]
    await renderClientSummaryReport()
}


async function renderClientSummaryReport(){
    const parent = document.getElementById("client-reports");
    if (!parent){
        return;
    }
    if (!c_runtime.clientsReports[c_runtime.currentClientIdView]){
        await fetchClientReports(c_runtime.currentClientIdView);
    }
    else{
        return
    }
    createBoxloading(parent)
    const data = c_runtime.clientsReports[c_runtime.currentClientIdView];
    const order = get_order_by_order_id(c_runtime.currentOrderIdView);
    if (!data){
        parent.innerHTML = `
            <div class="client-report-empty">
                <i class="fa-solid fa-chart-column"></i>
                <span>אין עדיין נתונים לדו"ח לקוח</span>
            </div>
        `;
        return;
    }

    const clientName = order.fullname || "-";
    const clientInitial = order.fullname ? order.fullname.charAt(0).toUpperCase() : "?";
    const clientHistory = renderClientHistory(data.history)
    parent.innerHTML = `
        <div class="client-report">
            <div class="client-report-profile">
                <div class="client-report-profile-head">
                    <div class="client-report-map-bg" id="clientReportProfileMap"></div>
                    <div>
                        <div class="avatar client-report-avatar">${reportEscapeHtml(clientInitial)}</div>
                        <div class="client-report-title">
                            <strong>${reportEscapeHtml(clientName)}</strong>
                        </div>
                    </div>
                    <div class="crt-info">
                        <small>${reportEscapeHtml(order.phone || "")}</small>
                        <i class="fa-solid fa-phone"></i>
                    </div>
                </div>
                <div class="client-report-total">
                    <div>
                        <span>סך הכנסות אחרי הוצאות</span>
                        <div>
                            <span class="rtf-number" id="fundsTotalIncome">${reportMoney(data.income)}</span>
                            <span class="rtf-shekel-icon">₪</span>
                        </div>
                    </div>
                    <div>
                        <i class="fa-solid fa-arrows-rotate btn-r-show-calendar" onclick="reloadClientSummaryReport(this)"></i>
                    </div>
                </div>
            </div>

            <div class="client-report-grid">
                <div class="client-report-stat">
                    <div>
                        <span>כסף ברוטו</span>
                        <strong class='income'>${reportMoney(data.funds)}+</strong>
                    </div>
                    <i class='icon icon-24'>${await icon("money")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>יתרה פתוחה</span>
                        <h4 class='income'>${reportMoney(data.balance)}+</h4>
                    </div>
                    <i class='icon icon-24'>${await icon("money-receive")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>ממוצע להזמנה</span>
                        <h4 class='income'>${reportMoney(data.ave_income)}+</h4>
                    </div>
                    <i class='icon icon-24'>${await icon("graph-color")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>הנחות</span>
                        <h4 class='expense'>${reportMoney(data.off_price)}-</h4>
                    </div>
                    <i class='icon icon-24'>${await icon("discount")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>הוצאות</span>
                        <h4 class='expense'>${reportMoney(data.expenses)}-</h4>
                    </div>
                    <i class='icon icon-24'>${await icon("expense")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>הזמנות</span>
                        <strong class=''>${data.orders_count}</strong>
                    </div>
                    <i class='icon icon-24'>${await icon("list")}</i>
                </div>
                <div class="client-report-stat four">
                    <div class="crf-stat">
                        <span>השולמו</span>
                        <span>בהמתנה</span>
                        <span>לא נסגרו</span>
                        <span>ביטולים</span>
                    </div>
                    <div class="crf-stat">
                        <div class="crfsi">
                            <i class='icon icon-16'>${await icon("done")}</i>
                            <strong class=''>${data.done}</strong>
                        </div>
                        <div class="crfsi">
                            <i class='icon icon-16'>${await icon("closed")}</i>
                            <strong class=''>${data.closed}</strong>
                        </div>
                        <div class="crfsi">
                            <i class='icon icon-16'>${await icon("cancel")}</i>
                            <strong class=''>${data.wait}</strong>
                        </div>
                        <div class="crfsi">
                            <i class='icon icon-16'>${await icon("cancel")}</i>
                            <strong class=''>${data.cancel||0}</strong>
                        </div>  
                    </div>
                </div>
            </div>

            <div class="client-report-section">
                <div class="client-report-section-head">
                    <span>סיכום פעילות</span>
                    <div>
                        <small>הצג הכל</small>
                        <i class="fa-solid fa-chevron-right fa-rotate-180"></i>
                    </div>
                    
                </div>
                <div class="client-report-events">
                    ${clientHistory}
                </div>
            </div>
        </div>
    `;

    renderClientReportProfileMap(order);
}
