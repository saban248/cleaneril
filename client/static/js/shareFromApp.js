async function shareOrderToClientAsPhoto(oid = c_runtime.currentOrderIdView, cid = c_runtime.currentClientIdView) {
    if (isCantExitEditOrder()){
        if (!(await askAboutExitEditOrder())){return}
    }

    if (!oid) {showToast("בחר הזמנה", ToastStat.ERROR);
        return;
    }

    const toastId = showToast("מכין...", ToastStat.LOAD);

    try {
        await showClientOrder(oid);
        await sleep(500);

        const orderElement = document.getElementById('the-client-card');
        if (!orderElement) {
            showToast("לא ניתן למצוא את תצוגת ההזמנה", ToastStat.ERROR, toastId);
            return;
        }

        const canvas = await html2canvas(orderElement, {
            scale: 2,
            allowTaint: true,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        canvas.toBlob(async (blob) => {
            if (!blob) {
                showToast("שגיאה בהמרת התמונה", ToastStat.ERROR, toastId);
                return;
            }

            const client = get_client_by_order_id(oid);
            const fileName = `order_${oid}.png`;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            try {
                // Try Web Share API first (works on iOS with HTTPS)
                if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: "image/png" })] })) {
                    await navigator.share({
                        title: "פרטי הזמנה",
                        text: `סיכום הזמנה עבור ${client?.fullname || 'לקוח'}`,
                        files: [new File([blob], fileName, { type: "image/png" })]
                    });
                    showToast("שותף בהצלחה", ToastStat.DONE, toastId);
                } else {
                    // Fallback to download
                    downloadFile(blob, fileName, isIOS);
                    showToast("התמונה הורדה", ToastStat.DONE, toastId);
                }
            } catch (shareErr) {
                console.error("Sharing failed:", shareErr);
                if (shareErr?.name === "AbortError") {
                    closeToast(toastId);
                    return;
                }
                downloadFile(blob, fileName, isIOS);
                showToast("התמונה הורדה", ToastStat.DONE, toastId);
            }
        }, "image/png", 0.95);

    } catch (err) {
        console.error("Capture failed:", err);
        showToast("שגיאה ביצירת התמונה", ToastStat.ERROR, toastId);
    }
}

// Helper function to download file with iOS support
function downloadFile(blob, fileName, isIOS = false) {
    const url = URL.createObjectURL(blob);
    
    if (isIOS) {
        // iOS specific: open in new window to trigger download
        const reader = new FileReader();
        reader.onloadend = function() {
            const newWindow = window.open();
            newWindow.document.write(`<img src="${reader.result}" style="max-width: 100%; height: auto;"/>`);
        };
        reader.readAsDataURL(blob);
    } else {
        // Desktop/Android: use traditional download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
}