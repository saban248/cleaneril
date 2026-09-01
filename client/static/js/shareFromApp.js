async function shareOrderToClientAsPhoto(oid = c_runtime.currentOrderIdView, cid = c_runtime.currentClientIdView) {
    if (isCantExitEditOrder()){
        if (!(await askAboutExitEditOrder())){return}
    }

    if (!oid) {showToast("בחר הזמנה", ToastStat.ERROR);
        return;
    }

    const toastId = showToast("", ToastStat.LOAD);

    try {
        // Ensure the order view is rendered for the capture
        await showClientOrder(oid);
        await sleep(300); // Wait for layout and rendering to finish
        await prepareOrderImage();

        if (!CONFIG.IMG_ORDER) {
            showToast(message.EneedRefresh, ToastStat.ERROR, toastId)
            return
        }

        const client = get_client_by_order_id(oid);
        const fileName = `order_${oid}.png`;
        const file = new File([CONFIG.IMG_ORDER], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: "פרטי הזמנה",
                text: `סיכום הזמנה עבור ${client?.fullname || 'לקוח'}`,
                files: [file]
            });
            showToast("שותף בהצלחה", ToastStat.DONE, toastId);
        } else {
            // Fallback to download if sharing files is not supported
            const link = document.createElement('a');
            link.href = URL.createObjectURL(CONFIG.IMG_ORDER);
            link.download = fileName;
            link.click();
            showToast("שיתוף קבצים אינו נתמך - התמונה הורדה", ToastStat.DONE, toastId);
        }
    } catch (err) {
        console.error("Sharing failed:", err);
        if (err?.name === "AbortError") {
            closeToast(toastId);
            return;
        }
        if (CONFIG.IMG_ORDER) {
            const link = document.createElement('a');
            const url = URL.createObjectURL(CONFIG.IMG_ORDER);
            link.href = url;
            link.download = `order_${oid}.png`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast("התמונה הורדה במקום שיתוף", ToastStat.DONE, toastId);
            return;
        }
        showToast("שגיאה ביצירת השיתוף", ToastStat.ERROR, toastId);
    }
}