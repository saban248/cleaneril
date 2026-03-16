var isMobile = window.innerWidth <= 768;
const LEVELS = {
    AUTH:1
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
    currentLeft.classList.add("show");
    currentRight.classList.remove("show");
}
function showSpecificLevel(level){
    const currentRight = document.getElementById("rlevel-"+currentLevel);
    const currentLeft = document.getElementById("llevel-"+currentLevel);
    const nextLeft = document.getElementById("llevel-"+level);
    const nextRight = document.getElementById("rlevel-"+level);

    currentLeft.classList.remove("show")
    currentRight.classList.remove("show")
    nextLeft.classList.add("show")
    nextRight.classList.add("show")
}

function completeRegsiterLevel(level){
    showSpecificLevel(level+1);
    currentLevel = level+1;
    welcomeForContinue()
}

function redirect(path){
    window.open("/"+path, "_blank");
}


function onBtnRegister(level, t, done = false){
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

function doRegister(t){
    const fullname = document.getElementById("fullname")
    const pwd1 = document.getElementById("pwd1");
    const csrf = document.getElementById("cXsXrF");
    onBtnRegister(LEVELS.AUTH, t)
    const data = {action:RegisterApi.level1, username:fullname, password:pwd1, xCSRF:csrf}
    apiPost(ApiRoute.register, data).then(
        res =>{
            if (!res.success){
                showToast("Message sent successfully")
            }
        }
    )
}



const pass=document.getElementById("pwd1")
const bar=document.getElementById("bar")
pass.addEventListener("input",()=>{
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

document.addEventListener("DOMContentLoaded", function (){
    welcomeForContinue();
}
)


const media = window.matchMedia("(max-width: 768px)");
media.addEventListener("change", (e) => {
    isMobile = e.matches;
    welcomeForContinue()

});

