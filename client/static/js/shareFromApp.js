const mainShareData = {
    title:'',
    text:'',
    files:[]
}


function canvasToBlob(canvas, type = "image/png", quality = 1) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Failed to create blob"));
            }
        }, type, quality);
    });
}

async function initshareOrderToClientAsPhoto(){
    const order = get_order_by_order_id(c_runtime.currentOrderIdView);
    mainShareData.title = `הזמנת ${getCleanOrderTypeText(order.order_type)}`;
    mainShareData.text =  getTtextShareCleanOrder(order.order_type, order.date*1000);
    mainShareData.files = []

    await shareOrderToClientAsPhoto(c_runtime.currentOrderIdView, c_runtime.currentClientIdView);
    const content = `
    <div class="share-order-to-client">
        <div>
            <span onclick="doNavigate()">שיתוף תמונה</span>
        </div>
        <div>
            <span>שיתוף קישור</span>
        </div>
        <button type="button" class="btn btn-primary" id="share-order-to-client-btn">שתף הזמנה</button>
    </div>`;
    createEditModal("שיתוף הזמנה ללקוח",null, null, {content:content, save:false});
}

async function shareOrderToClientAsPhoto(oid = c_runtime.currentOrderIdView, cid = c_runtime.currentClientIdView) {
    if (isCantExitEditOrder()){
        if (!(await askAboutExitEditOrder())){return}
    }

    if (!oid) {showToast("בחר הזמנה", ToastStat.ERROR);
        return;
    }

    const toastId = showToast("מכין...", ToastStat.LOAD, null , false);
    await showClientOrder(oid);
    const orderElement = document.getElementById('the-client-card');
    if (!orderElement) {
        showToast(message.ETemplateOrderFailed, ToastStat.ERROR, toastId);
        return;
    }
    try {
        const canvas = await html2canvas(orderElement, {
            scale: 2,
            allowTaint: true,
            useCORS: true,
            logging: false
        });

        const blob = await canvasToBlob(canvas);
        if (!blob) {
            showToast(message.ECreateOrderImgFailed, ToastStat.ERROR, toastId);
            return;
        }
        const fileName = `order_${oid}.png`;
        mainShareData.files.push(new File([blob], fileName, { type: "image/png" }));
        try {
            if (!navigator.canShare || !navigator.canShare(mainShareData)) {
                showToast(message.EShareOrderFailed, ToastStat.DONE, toastId);
                return
            }
            toastBody.appendChild(shareButton);
        } catch (shareErr) {
            showToast(message.EShareOrderFailed, ToastStat.ERROR, toastId);
        }

    } catch (err) {
        showToast(message.EShareOrderFailed, ToastStat.ERROR, toastId);
    }
}

async function doNavigate(mainShareData){
    try {
        await navigator.share(mainShareData);
    } catch (shareErr) {
        console.error("Sharing failed:", shareErr);
        if (shareErr?.name === "AbortError") {
            closeToast(toastId);
            return;
        }
    }
}




function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}