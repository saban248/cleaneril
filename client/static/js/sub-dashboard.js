
// MANAGER DASHBOARD 

function MDSetTtitle(){
    const manager = getManagerById(c_runtime.currentManagerIdView);
    const company = getCompanyByManagerId(c_runtime.currentManagerIdView);
    if (!company)return
    const titleManager = document.getElementById("managerNameTitle");
    titleManager.textContent = company.owner_fullname;
}


function onLoadManagerDashboard(){
    MDSetTtitle()
    switchManagerTab(MDTabsView.SUMMARY)
}



function switchManagerTab(viewId) {
    document.querySelectorAll('.md-view').forEach(view => {
        console.log(view.dataset.view, viewId)
        view.classList.toggle('show', view.dataset.view == viewId);
        
    });

    document.querySelectorAll('.md-tab-item').forEach(tab => {
        tab.classList.toggle('md-tab-selected', parseInt(tab.dataset.tab) === viewId);
    });
}




