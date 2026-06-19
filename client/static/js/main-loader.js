document.addEventListener("DOMContentLoaded", async function (){
    await fetchOrders();
    await fetchInvoice();
    await fetchClients();
    await fetchWorkers();
    await fetchPermissions();
})