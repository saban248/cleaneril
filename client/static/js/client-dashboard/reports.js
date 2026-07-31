

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
    return `${amount.toLocaleString("he-IL")}₪`;
}

function reportDate(value){
    if (!value){
        return "ללא תאריך";
    }
    return `${dateFloatToYMD(value)} ${dateFloatToHour(value)}`;
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

function renderClientSummaryReport(){
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
                    <div class="avatar client-report-avatar">${reportEscapeHtml(clientInitial)}</div>
                    <div class="client-report-title">
                        <span>פרופיל דו"ח סיכום לקוח</span>
                        <strong>${reportEscapeHtml(clientName)}</strong>
                        <small>${reportEscapeHtml(primaryOrder.phone || "")}</small>
                    </div>
                </div>
                <div class="client-report-total">
                    <span>סכום כל העסקאות של הלקוח</span>
                    <strong>${reportMoney(totalDeals)}</strong>
                </div>
            </div>

            <div class="client-report-grid">
                <div class="client-report-stat">
                    <span>כסף שנכנס</span>
                    <strong>${reportMoney(receivedMoney)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>יתרה פתוחה</span>
                    <strong>${reportMoney(openBalance)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>מספר עסקאות</span>
                    <strong>${orders.length}</strong>
                </div>
                <div class="client-report-stat">
                    <span>ממוצע עסקה</span>
                    <strong>${reportMoney(averageDeal)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>הושלמו</span>
                    <strong>${getClientReportStatCount(orders, StateOrder.DONE)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>בהמתנה</span>
                    <strong>${getClientReportStatCount(orders, StateOrder.CLOSED)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>לא נסגרו</span>
                    <strong>${getClientReportStatCount(orders, StateOrder.WAIT)}</strong>
                </div>
                <div class="client-report-stat">
                    <span>הנחות</span>
                    <strong>${reportMoney(totalDiscounts)}</strong>
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
}
