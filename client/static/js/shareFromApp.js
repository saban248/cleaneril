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

    const toastId = showToast("מכין...", ToastStat.LOAD, null , false);
    await showClientOrder(oid);
    const orderElement = document.getElementById('the-client-card');
    if (!orderElement) {
        showToast(message.EShareOrderFailed, ToastStat.ERROR, toastId);
        return;
    }
    const order = get_order_by_order_id(oid)
    const shareData = {
        title: `הזמנת ${getCleanOrderTypeText(order.order_type)}`,
        text: getTtextShareCleanOrder(order.order_type, order.date*1000),
        files: []
    };
    try {
        const canvas = await html2canvas(orderElement, {
            scale: 2,
            allowTaint: true,
            useCORS: true,
            logging: false
        });

        const blob = await canvasToBlob(canvas);
        if (!blob) {
            showToast("שגיאה ביצירת התמונה", ToastStat.ERROR, toastId);
            return;
        }
        const fileName = `order_${oid}.png`;
        shareData.files.push(new File([blob], fileName, { type: "image/png" }));
        try {
            if (!navigator.canShare || !navigator.canShare(shareData)) {
                showToast("שיתוף קבצים אינו נתמך", ToastStat.DONE, toastId);
                return
            }

            const toast = document.getElementById(toastId);
            const toastBody = document.getElementById(`${toastId}body`);
            if (!toast || !toastBody) {
                downloadFile(blob, fileName);
                showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
                return;
            }

            toastBody.innerText = "התמונה מוכנה לשיתוף";
            const shareButton = document.createElement("button");
            shareButton.type = "button";
            shareButton.innerText = "שתף";
            shareButton.addEventListener("click", async event => {
                event.stopPropagation();
                try {
                    await navigator.share(shareData);
                    closeToast(toastId);
                } catch (shareErr) {
                    console.error("Sharing failed:", shareErr);
                    if (shareErr?.name === "AbortError") {
                        closeToast(toastId);
                        return;
                    }
                    downloadFile(blob, fileName);
                    showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
                }
            });
            toastBody.appendChild(shareButton);
        } catch (shareErr) {
            console.error("Sharing failed:", shareErr);
            if (shareErr?.name === "AbortError") {
                closeToast(toastId);
                return;
            }
            downloadFile(blob, fileName);
            showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
        }
        

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