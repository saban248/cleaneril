


function setLogo() {
    const input = document.getElementById("setLogo");
    const logoImg = document.getElementById("logoView");

    // כשלוחצים על הלוגו פותחים בחירת קובץ
    input.click();
    
}

function editNameCompany(t){
    const viewName = document.getElementById("nameCompanyView")
    const inputName = document.getElementById("nameCompany")
    viewName.style.display = 'none'
    inputName.type = 'text'
}

function saveEditNameCompany(){
    const viewName = document.getElementById("nameCompanyView")
    const inputName = document.getElementById("nameCompany")
    viewName.style.display = 'block'
    inputName.type = 'hidden'

    const data = {action:ApiCall.conf_company, c_name:inputName.value}
    apiPost(ApiRoute.api, data).then(res =>{
        if (!res.success){
            openPopup(res.title, res.notice);
            return
        }
        location.reload()
    })
    
}

function editDescCompany(t){
    const viewDesc = document.getElementById("descCompanyView")
    const inputDesc = document.getElementById("descCompany")
    viewDesc.style.display = 'none'
    inputDesc.type = 'text'
}

function saveEditDescCompany(){
    const viewDesc = document.getElementById("descCompanyView")
    const inputDesc = document.getElementById("descCompany")
    viewDesc.style.display = 'block'
    inputDesc.type = 'hidden'
    const data = {action:ApiCall.conf_company, c_desc:inputDesc.value}
    apiPost(ApiRoute.api, data).then(res =>{
        if (!res.success){
            openPopup(res.title, res.notice);
            return
        }
        location.reload()
    })
}


document.addEventListener("DOMContentLoaded", function (){
    const inputLogo = document.getElementById("setLogo");
    const inputName = document.getElementById("nameCompany")
    const inputDesc = document.getElementById("descCompany")
    inputLogo.addEventListener("change", async () => {
        uploadImage(inputLogo.files[0], "nullptr", ApiUploadFile.LOGO)
    });

    inputName.addEventListener("blur", () => {
        saveEditNameCompany()
    });
    inputName.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveEditNameCompany()
        }
    });

    inputDesc.addEventListener("blur", () => {
        saveEditDescCompany()
    });

    inputDesc.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveEditDescCompany()
        }
    })

});