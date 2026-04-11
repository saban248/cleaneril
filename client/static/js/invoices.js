




async function createImgInvoice(template, img){
    await html2canvas(template, { scale: 2, backgroundColor: '#fff'}).then(canvas => {
        img.src = canvas.toDataURL('image/png');
    });
}

function closeViewInvoice(){
    const parent = document.getElementById("viewInvoice");
    parent.classList.remove('show');
    parent.classList.add('hide');
} 



function createInvoice(cid = c_runtime.currentClientIdView){
    if (isCantExitEditOrder()){
        if (!askAboutExitEditOrder()){return}

    }
    const data = {action:ApiCall.invoice_create, cid:cid}
    const toast = showToast(messgae.createInvoice)
    apiPost(ApiRoute.api, data).then(
        res =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                return
            }
            showToast('נוצר בהצלחה',ToastStat.DONE, toast);
            fetchInvoice();

        }
    )
}


function fetchInvoice(){
    apiPost(ApiRoute.api, {action:ApiCall.invoice_list}).then(
        res => {
            if (!res.success){
                showToast(messgae.notice, ToastStat.ERROR)
                return
            }
            c_runtime.invoices = res.invoices;
            for (invoice of c_runtime.invoices){
                invoice.order = JSON.parse(invoice.order);
                invoice.order.items = JSON.parse(invoice.order.items)
            }
            loadListInvoicesHtml()

        }
    )
}

function loadListInvoicesHtml(){
    const parent = document.getElementById("listInvoices")
    parent.replaceChildren();
    c_runtime.invoices.forEach(invoice => {
        const el = createInvoiceItem(invoice);
        parent.appendChild(el);
    });
}

function createInvoiceItem(invoice, actions = true, callback){
    const div = document.createElement("div");
    div.className = "cil-item "
    // div.dataset.stat = client.state;
    div.dataset.key = invoice.key;
    div.id = invoice.invoice_id;
    if (actions){
        div.ondblclick = () => {}
    }else{
        div.onclick = ()=> callback()
    }

    div.innerHTML = `
        <div class="avatar client-state-4">
        ${invoice.key}
        </div>
        
        <div class="content">
        <div class="in-content">
            <div class="top">
            <span class="name">Invoice-${invoice.key.toString().padStart(4, '0')}</span>
            <span class="phone no-mobile">${invoice.phone}</span>
            </div>
            <div class="bottom">
            <span>${dateFloatToYMD(invoice.date)} ${dateFloatToHour(invoice.date)}</span><br>
            <span>${invoice.total_price -invoice.off_price || 0}₪ •</span>
            <span class="client-state-text-${invoice.stat}">
                ${getStateClientText(1)}
            </span>
            </div>
        </div>
        </div>
        `
    if (actions){
        const clientActions = `
        <div class="client-footer">
        <i class="fa-solid fa-eye no-mobile"></i>
        <i class="fa-solid fa-share-from-square no-mobile"></i>
        <i class="fa-solid fa-bars menu-client"></i>
        </div>
        `;
        div.innerHTML += clientActions;
        
        const icons = div.querySelectorAll(".client-footer i");

        icons[0].onclick = () => viewClientOrder(client.client_id);
        icons[1].onclick = () => shareOrderToClientAsPhoto(client.client_id);
        icons[2].onclick = (e) => openMenuClient(e.target, client.client_id);
    }
    return div;
}

document.addEventListener("DOMContentLoaded", function (){
    fetchInvoice();
    
})