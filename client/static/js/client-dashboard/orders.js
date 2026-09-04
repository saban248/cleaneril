

async function initDuplicateCleanOrder(){
    const ask = await showAsk({title:"שיכפול הזמנה קיימת", msg:"ליצור העתק של ההזמנה הנוכחית?"})
    if (!ask)return
    await duplicateCleanOrder(c_runtime.currentClientIdView, c_runtime.currentOrderIdView)
}


async function duplicateCleanOrder(clientId, orderId){
    if (!clientId){clientId = c_runtime.currentClientIdView;}
    if (!orderId){orderId = c_runtime.currentOrderIdView;}

    const data = {action:ApiCall.duplicate_order, client_id:clientId, oi:orderId}
    const toast = showToast("משכפל הזמנה..");
    return await apiPost(ApiRoute.api, data).then(
        async (res) => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR, toast);
                return
            }
            else{
                // running..
            }
            closeClientDashboard()
            await fetchOrders()
            await editExistOrder(res.order_id)
            showToast(res.notice,ToastStat.DONE, toast)
        }
    )
}



async function deleteOrder(order_id = c_runtime.currentOrderIdView, callback, noNull = false){
    const ok = await showAsk({msg:message.WdeleteOrder})
    if (!ok){return false}
    if (!order_id){
        showToast("בחר הזמנה כדי למחוק", ToastStat.ERROR)
        return true
    }
    data = {oi:order_id, action:ApiCall.order_delete}
    return await new Promise((reslove) => apiPost(ApiRoute.api,data).then(
        async (res) =>{
            if (!res.success || res.deleted){
                showToast(res.notice, ToastStat.DONE);
                return false
            }
            await fetchOrders()
            createListClientOrders()
            callback?callback():null
            if (!noNull){
                c_runtime.currentOrderIdView = null
            }
            reslove(true)
        }
    ))
}


async function deleteOrderFromDashhbaord(order_id = c_runtime.currentOrderIdView) {
    await deleteOrder(order_id, ()=>openClientDashbaord(c_runtime.currentClientIdView), true)
    
}


function getOrdersByClientId(clientId){
    if (!clientId){return []}
    return c_runtime.orders.filter(order => order.client_id == clientId)
}


async function abortOrderEdit(){
    c_clients.order_edit = false;
    c_clients.enterCard = false;
    await showClientOrder()
    switchMenuActionClientCard()
}

async function restoreOrder(orderId){
    const data = {action:ApiCall.order_restore, oi:orderId}
    await apiPost(ApiRoute.api, data).then(
        async (res) =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR);
                return
            }
            await fetchOrders()
            await reloadOnPageClients()
            showToast(res.notice, ToastStat.DONE);
        }
    )
}
