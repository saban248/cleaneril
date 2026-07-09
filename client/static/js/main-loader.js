async function fetchMyCompany() {
    const data = {action:ApiCall.my_company}
    return new Promise((resolve)=>{
        apiPost(ApiRoute.api, data).then(
            (res) =>{
                if (!res.success){
                    showToast(res.notice, ToastStat.ERROR);
                }
                else{
                    c_runtime.company = res.company;
                }
                resolve(res);
            }
        )
    })
}

async function fetchMySubscription(){
    const data = {action:ApiCall.my_subscription}
    return new Promise((resolve)=>{
        apiPost(ApiRoute.api, data).then(
            (res) =>{
                if (!res.success){
                    showToast(res.notice || 'שגיאה בטעינת המנוי', ToastStat.ERROR);
                }
                else{
                    c_runtime.subscription = res.sub;
                }
                resolve(res);
            }
        )

    }); 

}

async function fetchMyManager() {
    const data = {action:ApiCall.my_manager}
    return new Promise((resolve)=>{
        apiPost(ApiRoute.api, data).then(
            (res) =>{
                if (!res.success){
                    showToast(res.notice, ToastStat.ERROR);
                }
                else{
                    c_runtime.manager = res.manager;   
                }
                resolve(res);
            }
        )
    }); 
}


document.addEventListener("DOMContentLoaded", async function (){
    await fetchOrders();
    await fetchInvoice();
    await fetchClients();
    await fetchWorkers();
    await fetchPermissions();
    await fetchManagers();
    await fetchCompanies();
    await fetchSubscriptions();
    await fetchMySubscription();
    if (typeof renderSubscriptionTable === "function"){
        renderSubscriptionTable();
    }
    if (location.pathname != PageRoute.auth || location.pathname != PageRoute.createAccount){
        doAlive()
    }
    
})
