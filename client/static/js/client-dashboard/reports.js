

async function fetchClientReports(clientId) {
    if (!clientId){
        clientId = c_runtime.currentClientIdView;
    }
    const data = {action:ApiCall.client_reports, client_id:clientId}
    await apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice,ToastStat.ERROR);
                return
            }

            console.log(res.reports)
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
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false
    }).setView(coordinates, 12);

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

function getClientReportPrimaryOrder(){
    return c_runtime.orders.find(order => order.order_id == c_runtime.currentOrderIdView)
        || c_runtime.orders.find(order => order.client_id == c_runtime.currentClientIdView)
        || null;
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

function getClientReportStatCount(orders, stat){
    return orders.filter(order => order.stat & stat).length;
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

async function renderClientSummaryReport(){
    const parent = document.getElementById("client-reports");
    if (!parent){
        return;
    }

    const orders = getClientReportOrders();
    if (!orders.length){
        parent.innerHTML = `
            <div class="client-report-empty">
                <i class="fa-solid fa-chart-column"></i>
                <span>אין עדיין נתונים לדו"ח לקוח</span>
            </div>
        `;
        return;
    }

    const primaryOrder = getClientReportPrimaryOrder() || orders[0];
    const receipts = getClientReportReceipts(orders);
    const events = buildClientReportEvents(orders, receipts);
    const totalDeals = orders.reduce((total, order) => total + reportOrderTotal(order), 0);
    const receivedMoney = receipts.reduce(function(total, receipt){
        const order = orders.find(item => item.order_id == receipt.order_id);
        return total + reportOrderTotal(order);
    }, 0);
    const totalDiscounts = orders.reduce((total, order) => total + (parseInt(order.off_price) || 0), 0);
    const averageDeal = orders.length ? Math.round(totalDeals / orders.length) : 0;
    const openBalance = Math.max(0, totalDeals - receivedMoney);
    const lastOrder = orders.slice().sort((a, b) => (b.date || 0) - (a.date || 0))[0];
    const clientName = primaryOrder.fullname || "לקוח";
    const clientInitial = clientName.trim().charAt(0) || "?";

    const eventHtml = events.slice(0, 12).map(function(event){
        return `
            <div class="client-report-event client-report-event-${event.type}">
                <div class="client-report-event-icon">
                    <i class="${event.icon}"></i>
                </div>
                <div class="client-report-event-content">
                    <strong>${reportEscapeHtml(event.title)}</strong>
                    
                    <span>${reportEscapeHtml(event.text)}</span>
                    <small>${reportDate(event.date)}</small>
                </div>
                <div class="client-report-event-amount">${reportMoney(event.amount)}</div>
            </div>
        `;
    }).join("");

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
                        <small>${reportEscapeHtml(primaryOrder.phone || "")}</small>
                        <i class="fa-solid fa-phone"></i>
                    </div>
                </div>
                <div class="client-report-total">
                    <div>
                        <span>סך הכנסות אחרי הוצאות</span>
                        <div>
                            <span class="rtf-number" id="fundsTotalIncome">${reportMoney(totalDeals)}</span>
                            <span class="rtf-shekel-ion">₪</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="client-report-grid">
                <div class="client-report-stat">
                    <div>
                        <span>כסף שנכנס</span>
                        <strong class='income'>${reportMoney(receivedMoney)}+</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("money")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>יתרה פתוחה</span>
                        <strong class='income'>${reportMoney(openBalance)}+</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("alarm")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>ממוצע להזמנה</span>
                        <strong class='income'>${reportMoney(averageDeal)}+</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("graph-color")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>הנחות</span>
                        <strong class='expense'>${reportMoney(totalDiscounts)}-</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("discount")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>הזמנות</span>
                        <strong class=''>${orders.length}</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("list")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>השולמו</span>
                        <strong class=''>${getClientReportStatCount(orders, StateOrder.DONE)}</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("num1")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>בהמתנה</span>
                        <strong class=''>${getClientReportStatCount(orders, StateOrder.CLOSED)}</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("calendar-color")}</i>
                </div>
                <div class="client-report-stat">
                    <div>
                        <span>לא נסגרו</span>
                        <strong class=''>${getClientReportStatCount(orders, StateOrder.WAIT)}</strong>
                    </div>
                    <i class='icon icon-32'>${await icon("finish-register")}</i>
                </div>
            </div>

            <div class="client-report-section">
                <div class="client-report-section-head">
                    <span>סיכום פעילות</span>
                    <small>עדכון אחרון: ${reportDate(lastOrder?.date)}</small>
                </div>
                <div class="client-report-events">
                    ${eventHtml || `<div class="client-report-empty">אין אירועים להצגה</div>`}
                </div>
            </div>
        </div>
    `;

    renderClientReportProfileMap(primaryOrder);
}
