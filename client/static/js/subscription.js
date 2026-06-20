const c_sub = {
    filterMenuOn:[],
    s:null,
    t:null,
    o:null
} 

function switchFilterOptions(_id){
    const off = document.getElementById(_id).classList.contains("show")
    for (cls of c_sub.filterMenuOn){
        document.getElementById(cls).classList.remove("show")
    }
    if (off){
        return
    }
    toggleFilterOptions(_id)
}


function toggleFilterOptions(_id) {
    const fss = document.getElementById(_id);
    fss.classList.toggle('show');

    if (!c_sub.filterMenuOn.includes(_id)){
        c_sub.filterMenuOn.push(_id)
    }
}



function selectSubscriptionState(_id, t) {
    const vss = document.getElementById('viewSubscriptionStat');
    const stat = parseInt(t.dataset.s);
    const statText = getSubscriptionStatText(stat);
    vss.textContent = statText
    c_sub.s = stat
    toggleFilterOptions(_id)
}


function selectSubscriptionType(_id, t){
    const vst = document.getElementById('viewSubscriptionType');
    const stat = parseInt(t.dataset.s);
    const statText = getSubscriptionTypeText(stat);
    vst.textContent = statText
    c_sub.t = stat
    toggleFilterOptions(_id)
}


function selectSubscriptionOrder(_id, t){
    const vso = document.getElementById('viewSubscriptionOrder');
    const stat = parseInt(t.dataset.s);
    c_sub.o = stat;
    const statText = getSubscriptionOrderText(stat);
    console.log(stat, statText)
    vso.textContent = statText
    toggleFilterOptions(_id)
}


function closeSearchManager(t){
    closeSearchInput('searchManager', t)
    doSearchManagersLocal()
}


function doSearchManagersLocal(){
    const input = document.getElementById("searchManager")
    const value = input.value.toLowerCase();
    for (const manager of c_runtime.managers){
        const manager_id = manager.manager_id
        const phone = cleanPhoneJustNumbers(manager.phone).includes(value);
        if ((value == ''||phone)){
            document.getElementById(order_id).classList.remove("hide")
        }
        else{
            document.getElementById(order_id).classList.add("hide")
        }
    }
}