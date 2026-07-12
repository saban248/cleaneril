import {c_marketplace} from './protocol.js'



const MarketplaceApiCall = {
    listJobs:1
}


 // FETCH
async function fetchJobs(){
    const data = {action:MarketplaceApiCall.listJobs}
    const res = await apiPost(ApiRoute.marketplace, data);
    if (!res.success){
        showToast(res.notice, ToastStat.ERROR)
        return res
    }
    c_marketplace.jobs = res.jobs;
    return res
}