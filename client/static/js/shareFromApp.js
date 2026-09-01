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


async function shareOrderToClientAsPhoto(oid = c_runtime.currentOrderIdView, cid = c_runtime.currentClientIdView) {
    if (isCantExitEditOrder()){
        if (!(await askAboutExitEditOrder())){return}
    }

    if (!oid) {showToast("בחר הזמנה", ToastStat.ERROR);
        return;
    }

    const toastId = showToast("מכין...", ToastStat.LOAD);
    await showClientOrder(oid);
    const orderElement = document.getElementById('the-client-card');
    if (!orderElement) {
        showToast(message.EShareOrderFailed, ToastStat.ERROR, toastId);
        return;
    }
    const order = getOrderByOrderId(oid)
    const shareData = {
        title: `הזמנת ${getCleanOrderTypeText(order.order_type)}`,
        text: `הזמנת  ${getCleanOrderTypeText(order.type_order)} `,
    };
    try {
        const canvas = await html2canvas(orderElement, {
            scale: 2,
            allowTaint: true,
            useCORS: true,
            logging: false
        });

        canvas.toBlob(async (blob) => {
            if (!blob) {
                showToast("שגיאה בהמרת התמונה", ToastStat.ERROR, toastId);
                return;
            }

            const client = get_client_by_order_id(oid);
            const fileName = `order_${oid}.png`;
            const file = new File([blob], fileName, { type: "image/png" });

            try {
                if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                    downloadFile(blob, fileName);
                    showToast("שיתוף קבצים אינו נתמך - התמונה הורדה", ToastStat.DONE, toastId);
                    return
                }
                await navigator.share({
                    title: "פרטי הזמנה",
                    text: `סיכום הזמנה עבור ${client?.fullname || 'לקוח'}`,
                    files: [file]
                });
                showToast("שותף בהצלחה", ToastStat.DONE, toastId);
            } catch (shareErr) {
                console.error("Sharing failed:", shareErr);
                if (shareErr?.name === "AbortError") {
                    closeToast(toastId);
                    return;
                }
                downloadFile(blob, fileName);
                showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
            }
        }, "image/png", 1);

    } catch (err) {
        console.error("Capture failed:", err);
        showToast("שגיאה ביצירת התמונה", ToastStat.ERROR, toastId);
    }
}

// Helper function to download file
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