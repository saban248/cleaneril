document.addEventListener("DOMContentLoaded", async function (){
    await fetchOrders();
    await fetchInvoice();
    await fetchClients();
    await fetchWorkers();
    await fetchPermissions();
    await fetchManagers();
    await fetchCompanies();
    if (typeof renderSubscriptionTable === "function"){
        renderSubscriptionTable();
    }
    if (location.pathname != PageRoute.auth || location.pathname != PageRoute.createAccount){
        doAlive()
    }
    
})
