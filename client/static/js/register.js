var isMobile = window.innerWidth <= 768;
const LEVELS = {
    AUTH:1,
    COMPANY:2,
    LOGO:3,
    FINISH:4
}
var currentLevel = LEVELS.AUTH;


function continueToLevel(){
    const currentLeft = document.getElementById("llevel-"+currentLevel);
    const currentRight = document.getElementById("rlevel-"+currentLevel);
    currentLeft.classList.remove("show");
    currentRight.classList.add("show");
}

function welcomeForContinue(){
    if (!isMobile){
        showSpecificLevel(currentLevel)
        return
    }
    const currentLeft = document.getElementById("llevel-"+currentLevel);
    const currentRight = document.getElementById("rlevel-"+currentLevel);
    currentLeft?.classList.add("show");
    currentRight?.classList.remove("show");
}
function showSpecificLevel(level){
    const currentRight = document.getElementById("rlevel-"+currentLevel);
    const currentLeft = document.getElementById("llevel-"+currentLevel);
    const nextLeft = document.getElementById("llevel-"+level);
    const nextRight = document.getElementById("rlevel-"+level);

    currentLeft?.classList.remove("show")
    currentRight?.classList.remove("show")
    nextLeft?.classList.add("show")
    nextRight?.classList.add("show")
}

function completeRegsiterLevel(level){
    showSpecificLevel(level+1);
    currentLevel = level+1;
    welcomeForContinue()
}

function redirect(path){
    location.href = "/"+path;
}


function onApiCall(t, done = false){
    const icon = t.children[1]
    if (done){
        icon.style.display = 'none'
        t.children[0].style.display = 'block';
        t.disabled = false;
    }
    else{
        icon.style.display = 'block';
        t.children[0].style.display = 'none';
        t.disabled = true;
    }
    
}
function completeFromCacheHistory(){
    const cahceData = ManagerCache.getRegisterHistory()
    // level 2
    ld2 = cahceData[RegisterApi.level2]
    if (Object.keys(ld2).length != 0){
        document.getElementById('ownerVATCode').value = ld2.vc;
        document.getElementById("onwerName").value = ld2.fn;
        document.getElementById("onwerPhone").value = ld2.op;
        document.getElementById("companyPhone").value = ld2.cp;
        document.getElementById("companyDesc").value = ld2.d;
        document.getElementById("companyName").value = ld2.cn
    }


}
function doRegister(t){
    const fullname = document.getElementById("username").value;
    const pwd1 = document.getElementById("pwd1").value;
    const pwd2 = document.getElementById("pwd2").value;
    const csrf = document.getElementById("cXsXrF");
    if (pwd1!==pwd2){
        showToast("הסיסמאות לא תואמות", ToastStat.ERROR);
        return;
    }
    onApiCall(t)
    const data = {action:RegisterApi.level1, username:fullname, password:pwd1, xCSRF:csrf.value}
    apiPost(ApiRoute.register, data).then(
        res =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR)
            }
            else{
                completeRegsiterLevel(LEVELS.AUTH)
                csrf.value = res.mid;
            }
            onApiCall(t, true)
        }
    )
}

function doCompany(t){
    const vatCode = document.getElementById("ownerVATCode").value;
    const fullname = document.getElementById("onwerName").value;
    const onwerPhone = cleanPhoneJustNumbers(document.getElementById("onwerPhone").value);
    const companyPhone = cleanPhoneJustNumbers(document.getElementById("companyPhone").value);
    const companyName = document.getElementById("companyName").value;
    const desc = document.getElementById("companyDesc").value;
    const csrf = document.getElementById("cXsXrF").value;

    if (!isValidIsraeliID(vatCode)){
        showToast("מספר עוסק / ת.ז לא תקין", ToastStat.ERROR)
        return;
    }
    if (!isValidPhone(onwerPhone) || (companyPhone != '' && isValidPhone(companyPhone))){
        showToast("מספר הפלאפון לא תקין", ToastStat.ERROR)
        return;
    }

    if (companyName.split(/\s+/).length < 2){
        showToast("העסק חייב להכיל 2 מילים", ToastStat.ERROR)
        return;
    }

    const descWords = desc.split(/\s+/)
    if (descWords.length < 3 || descWords.length > 4){
        showToast("תיאור העסק לא תקין", ToastStat.ERROR)
        return;
    }
    ManagerCache.setRegisterHisotry(RegisterApi.level2, {
        vc:vatCode,
        fn:fullname,
        op:onwerPhone,
        cp:companyPhone,
        cn:companyName,
        d:desc

    })

    onApiCall(t)
    const data = {action:RegisterApi.level2, c_phone:companyPhone,o_phone:onwerPhone, c_name:companyName, c_desc:desc, mid:csrf, o_name:fullname,
        vat_code:vatCode
    }
    apiPost(ApiRoute.register, data).then(
        res =>{
            onApiCall(t, true)
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR);
                return
            }
            completeRegsiterLevel(LEVELS.COMPANY)
        }
    )
}




function setLogo() {
    const input = document.getElementById("setLogo");
    input.click();
}

function doLogo(t){
    const img = document.getElementById('setLogo');
    const csrf = document.getElementById("cXsXrF").value;
    const file = img.files[0];

    const reader = new FileReader();
    reader.onload = function () {
        const base64Data = reader.result.split(",")[1];
        apiPost(ApiRoute.register, {
            filename:'ok',
            action:RegisterApi.level3,
            data: base64Data
        }).then(res => {
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR)
                return;
            }
            completeRegsiterLevel(LEVELS.LOGO);
            onApiCall(t,true)

        });
    };
    reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", function (){
    const pass=document.getElementById("pwd1")
    const bar=document.getElementById("bar")
    pass?.addEventListener("input",()=>{
        let v=pass.value
        let s=0
        if(v.length>5) s+=25
        if(/[A-Z]/.test(v)) s+=25
        if(/[0-9]/.test(v)) s+=25
        if(/[^A-Za-z0-9]/.test(v)) s+=25
        bar.style.width=s+"%"
        if(s<=25) bar.style.background="red"
        else if(s<=50) bar.style.background="orange"
        else if(s<=75) bar.style.background="gold"
        else bar.style.background="limegreen"
    })
    const input = document.getElementById("setLogo")
    const img = document.getElementById("logoView")

    input?.addEventListener("change", () => {
        const file = input.files[0]
        if (file) {
            img.src = URL.createObjectURL(file)
        }
    })
    const media = window.matchMedia("(max-width: 768px)");
        media.addEventListener("change", (e) => {
            isMobile = e.matches;
            welcomeForContinue()

    });
    completeFromCacheHistory()
    welcomeForContinue();
}
)




function uploadImage(t, file, name, action, mid, callback) {
    if (!file)return;
    const reader = new FileReader();
    switch (action){
        case ApiUploadFile.CARD:
        case ApiUploadFile.LOGO:
            reader.onload = function () {
                const base64Data = reader.result.split(",")[1];
                apiPost(ApiRoute.upImage, {
                    filename:name,
                    action:action,
                    mid:mid,
                    data: base64Data
                }).then(res => {
                    if (!res.success){
                        showToast("העלאת התמונה נכשלה")
                        onApiCall(t,true)
                        return;
                    }
                    if (action == ApiUploadFile.LOGO){
                        callback()
                    }

                });
            };
            reader.readAsDataURL(file);
            
    }
}