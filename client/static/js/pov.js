const c_pov = {
    publicCleanOrderVerified:{}
}

document.addEventListener("DOMContentLoaded", ()=>{
    form = document.getElementById('verify-form'),
    input = document.getElementById('cleanOrderId'),

    document.getElementById('year').textContent = new Date().getFullYear();
    input.addEventListener('input', () => {
        const validFormat = input.value.split("-").length == 2
        !validFormat?input.classList.add("invalid"):input.classList.remove("invalid")

    });


    form.addEventListener('submit', async event => {
        doCleanOrderVerifiction(event)

    });



})


function showResult(stat, title, text) {
    result = document.getElementById('verify-result');
    result.className = `result visible r-${stat}`;
    result.innerHTML = `<i class="${getIconByStatToast(stat)}"></i>`
    const copy = document.createElement('div'),
        heading = document.createElement('strong'),
        message = document.createElement('span');
    heading.textContent = title;
    message.textContent = text;
    copy.append(heading, message);
    result.append(copy);
}

function removeResult(){
    result = document.getElementById('verify-result');
    result.classList.remove("visible")
    result.replaceChildren()
}

function onSubmitVerifiction(){
    const btn = document.getElementById("verify-button")
    btn.children[0].textContent = 'בודק...'
    btn.disabled = true;

}
function onResponseVerifiction(success = true){
    const btn = document.getElementById("verify-button");
    btn.children[0].textContent = 'אימות הזמנה'
    btn.disabled = false;
    if (!success)return
    const input = document.getElementById("cleanOrderId")
    input.disabled = true;
    btn.children[0].textContent = 'הצג פרטים'
    btn.type = "button";
    btn.onclick = showOrderVerified;
    

}
function showIsValidOrderID(){
    const orderIdVerified = document.getElementById("orderIdVerified")
    orderIdVerified.style.display = 'block'

}

async function showOrderVerified(){

    const data = c_pov.publicCleanOrderVerified;
    const btn = document.getElementById("verify-button");
    const form = document.getElementById("verify-form");
    const input = document.getElementById("cleanOrderId");
    const orderStatText = getOrderStatText(data.stat).replace("!", "")
    const orderStatIcon = getOrderStatIcon(data.stat)
    const orderDate = 
    input.remove()
    form.replaceChildren()
    form.insertAdjacentHTML("afterend", `
        <section class="verified-order-details" id="verified-order-details" aria-labelledby="verified-order-title">
            <div class="verified-order-header" aria-hidden="true">
                <div>
                    <i class="icon icon-24">${await icon("verify")}</i>
                    <span>מאומת</span>
                </div>
                <span class="close-verified" onclick="closeOrderVerified()">
                    <i class="fa-solid fa-arrow-rotate-left"></i>
                   <span>בדיקה נוספת</span>
                </span>
            </div>
            <div class="verified-order-copy">
                <h2 id="verified-order-title">פרטי ההזמנה</h2>
                <p>משוייך לעסק ב-cleanerIL</p>
            </div>
            <div class="order-verified-items">
                <div class="order-verified-item" aria-label="מספר ההזמנה ייחודי">
                    <i class="fa-solid fa-fingerprint"></i>
                    <div>
                        <dt>מזהה</dt>
                        <dd id="verified-order-value">${input.value.toLocaleUpperCase()}</dd>
                    </div>
                </div>
                <div class="order-verified-item" aria-label="פרטי הספק">
                    <i class="fa-regular fa-building"></i>
                    <div>
                        <dt>שם העסק</dt>
                        <dd>${data.company_name}</dd>
                    </div>
                </div>
                <div class="order-verified-item" aria-label="פרטי יצירת קשר">
                    <i class="fa-solid fa-square-phone-flip"></i>
                    <div>
                        <dt>מספר העסק</dt>
                        <dd href="tel:${data.company_phone}">${data.company_phone}</dd>
                    </div>
                </div>
                <div class="order-verified-item" aria-label="סטטוס הזמנה">
                    <i class="${orderStatIcon}"></i>
                    <div>
                        <dt>מצב הזמנה</dt>
                        <dd>${orderStatText} בתאריך ${}</dd>
                    </div>
                </div>
            </div>
        </section>
    `);
}


function closeOrderVerified(){
    location.reload()
}


async function doCleanOrderVerifiction(event){
    removeResult()
    event.preventDefault()
    const input = document.getElementById("cleanOrderId")
    const [key, orderId] = input.value.trim().split("-");

    if (!key || !orderId) {
        input.focus();
        showResult(ToastStat.ERROR, 'מזהה לא תקין', 'יש להזין את המזהה כפי שמופיע על גבי ההזמנה.');
        return;
    }
    onSubmitVerifiction()
    const data = {action:PublicApi.cleanOrderVerifiction, key:key, oi:orderId}
    await apiPost("/papi", data).then(
        (res) =>{
            if (!res.success){
                showResult(ToastStat.ERROR, res.title, res.notice)
            }else{
                // Supports both a flat JSON response and a {data: PovDetails} wrapper.
                showIsValidOrderID()
                c_pov.publicCleanOrderVerified = res
            }
            onResponseVerifiction(res.success)

        }
    )


}
