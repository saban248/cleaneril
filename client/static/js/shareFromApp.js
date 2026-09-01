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
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "פרטי הזמנה",
                        text: `סיכום הזמנה עבור ${client?.fullname || 'לקוח'}`,
                        files: [file]
                    });
                    showToast("שותף בהצלחה", ToastStat.DONE, toastId);
                } else {
                    // Fallback to download if sharing files is not supported
                    downloadFile(blob, fileName);
                    showToast("שיתוף קבצים אינו נתמך - התמונה הורדה", ToastStat.DONE, toastId);
                }
            } catch (shareErr) {
                console.error("Sharing failed:", shareErr);
                if (shareErr?.name === "AbortError") {
                    closeToast(toastId);
                    return;
                }
                downloadFile(blob, fileName);
                showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
            }
        }, "image/png", 0.95);

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