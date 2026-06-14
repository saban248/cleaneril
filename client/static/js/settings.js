


function setLogo() {
    const input = document.getElementById("setLogo");
    const logoImg = document.getElementById("logoView");

    // כשלוחצים על הלוגו פותחים בחירת קובץ
    input.click();
    
}
function editConfig(view, input){
    view.style.display = 'none'
    input.type = 'text'
}
function saveConfig(view, input, config){
    view.style.display = 'block'
    input.type = 'hidden'
    const toast = showToast("מעבד...")
    const data = {action:ApiCall.conf_company, ...config}
    apiPost(ApiRoute.api, data).then(res =>{
        if (!res.success){
            showToast(res.notice, ToastStat.ERROR, toast);
            return
        }
        view.textContent = input.value
        showToast("עודכן בהצלחה!", ToastStat.DONE, toast);
    })
}

function editNameCompany(t){
    const viewName = document.getElementById("nameCompanyView")
    const inputName = document.getElementById("nameCompany")
    editConfig(viewName, inputName)
}

function saveEditNameCompany(){
    const viewName = document.getElementById("nameCompanyView")
    const inputName = document.getElementById("nameCompany")
    saveConfig(viewName, inputName, {c_name:inputName.value})
    
}

function editDescCompany(t){
    const viewDesc = document.getElementById("descCompanyView")
    const inputDesc = document.getElementById("descCompany")
    editConfig(viewDesc, inputDesc)
}

function saveEditDescCompany(){
    const viewDesc = document.getElementById("descCompanyView")
    const inputDesc = document.getElementById("descCompany")
    saveConfig(viewDesc, inputDesc, {c_desc:inputDesc.value})
}

function editPhoneCompany(t){
    const viewPhone = document.getElementById("phoneCompanyView")
    const inputPhone = document.getElementById("phoneCompany")
    editConfig(viewPhone, inputPhone)
}

function saveEditPhoneCompany(){
    const viewPhone = document.getElementById("phoneCompanyView")
    const inputPhone = document.getElementById("phoneCompany")
    saveConfig(viewPhone, inputPhone, {c_phone:inputPhone.value})
}


function editEmailCompany(){
    const view = document.getElementById("emailCompanyView")
    const input = document.getElementById("emailCompany")
    editConfig(view, input)
}
function saveEditEmailCompany(){
    const view = document.getElementById("emailCompanyView")
    const input = document.getElementById("emailCompany")
    saveConfig(view, input, {c_email:input.value})
}

function editVATCompany(){
    const view = document.getElementById("VATCompanyView")
    const input = document.getElementById("VATCompany")
    editConfig(view, input)
}
function saveEditVATCompany(){
    const view = document.getElementById("VATCompanyView")
    const input = document.getElementById("VATCompany")
    saveConfig(view, input, {c_vat_code:input.value})
}

function editGPSECompany(){
    const view = document.getElementById("GPSECompanyView")
    const input = document.getElementById("GPSECompany")
    editConfig(view, input)
}

function saveGPSECompany(){
    const view = document.getElementById("GPSECompanyView")
    const input = document.getElementById("GPSECompany")
    saveConfig(view,input, {c_gpse:input.value.replace(/\D+/g, '')})
}

document.addEventListener("DOMContentLoaded", function (){
    const inputLogo = document.getElementById("setLogo");
    const inputName = document.getElementById("nameCompany")
    const inputDesc = document.getElementById("descCompany")
    const inputPhone = document.getElementById("phoneCompany")
    const inputEmail = document.getElementById("emailCompany")
    const inputVAT = document.getElementById("VATCompany")
    const inputGPSE = document.getElementById("GPSECompany")
    inputLogo.addEventListener("change", async () => {
        uploadImage(inputLogo.files[0], "nullptr", ApiUploadFile.LOGO)
    });

    inputName.addEventListener("blur", () => {saveEditNameCompany()});
    inputName.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveEditNameCompany()}});

    inputDesc.addEventListener("blur", () => {saveEditDescCompany()});
    inputDesc.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveEditDescCompany()}})

    inputPhone.addEventListener("blur", () => {saveEditPhoneCompany()});
    inputPhone.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveEditPhoneCompany()}})
        
    inputEmail.addEventListener("blur", () => {saveEditEmailCompany()});
    inputEmail.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveEditEmailCompany()}})

    inputVAT.addEventListener("blur", () => {saveEditVATCompany()});
    inputVAT.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveEditVATCompany()}})

    inputGPSE.addEventListener("blur", () => {saveGPSECompany()});
    inputGPSE.addEventListener("keydown", (e) => {if (e.key === "Enter") {saveGPSECompany()}})

});