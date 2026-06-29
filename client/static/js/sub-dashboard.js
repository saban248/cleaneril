
// MANAGER DASHBOARD 

function MDSetTtitle(m, c){
    const titleManager = document.getElementById("managerNameTitle");
    titleManager.textContent = c.owner_fullname;
}
function MDSetLogoCompany(m, c){
    const logo = document.getElementById("companyLogo")
    const logo_path = `/static/images/logo/${c.logo_path}`
    logo.style.backgroundImage = `url('${logo_path}')`;
    logo.style.backgroundSize = "cover";
    logo.style.backgroundPosition = "center";
    logo.style.backgroundRepeat = "no-repeat";
}

function MDSetViewSummary(m, c){
    const fullname = document.getElementById("managerName");
    const managerPhone = document.getElementById("managerPhone");
    const managerUserName = document.getElementById("managerUserName");
    const companyName = document.getElementById("companyName");
    const companyVAT = document.getElementById("companyVAT");
    const companyPhone = document.getElementById("companyPhone")
    const companyEmail = document.getElementById("companyEmail");

    fullname.textContent = c.owner_fullname;
    managerPhone.textContent = m.phone;
    managerUserName.textContent = m.username;
    companyName.textContent = c.company_name;
    companyVAT.textContent = Boolean(c.vat_company)?"מורשה":"פטור"
    companyPhone.textContent = c.company_phone;
    companyEmail.textContent = c.company_email;
}


function onLoadManagerDashboard(){
    const manager = getManagerById(c_runtime.currentManagerIdView);
    const company = getCompanyByManagerId(c_runtime.currentManagerIdView);
    if (!company)return
    MDSetTtitle(manager, company)
    MDSetLogoCompany(manager, company)
    MDSetViewSummary(manager, company)
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




