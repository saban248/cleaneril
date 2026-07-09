const c_settings = {
    max_size_logo:5*(1024*1024),
    sad:{
        c_name: null,
        c_desc: null,
        c_owner: null,
        c_email: null,
        c_vat: null,
        c_vat_code: null,
        c_phone: null,
        o_phone: null,
        c_gpse: null
    }, // setting api data

}

function setLogo() {
    const input = document.getElementById("setLogo");
    input.click();
}

function setTagSubscription(){
    const logoCompanyTag = document.getElementById("logoCompanyTag");
    const plan = c_runtime.subscription?.subscription_plan || UserAccountSubscription.FREE;
    const planName = getUserAccountSubscriptionTextEnglish(plan);
    logoCompanyTag.textContent = planName;
    logoCompanyTag.classList.add(planName.toLocaleLowerCase())

    const companyVerified = document.getElementById("companyVerified");
    const companyUnverified = document.getElementById("companyUnverified");
    if (c_runtime.company.company_approved && c_runtime.manager.account_approved){
        companyVerified.classList.add("show")
    }
    else{
        companyUnverified.classList.add("show")
    }

}
function onLoadSetttings(){
    setTagSubscription()    
}

/**
 * Create an edit modal for inline editing
 */
function createEditModal(title, currentValue, keySad, {content = 0} = {}) {
    // Remove existing modal if any
    const settingsContentModal = document.getElementById("settingsContentModal")
    const settingsDefaultContentModal = document.getElementById("settingsDefaultContentModal");
    const modal = document.getElementById("settingsEditModal");
    const elTitle = document.getElementById("emsTitle");
    const lastValue = document.getElementById("emsLastValue");
    const elCurrentValue = document.getElementById("emsCurrentValue");
    const emsSave = document.getElementById("emsSave");
    elTitle.textContent = title
    const h = (e) => {e.classList.add("hide");e.classList.remove("show")}
    const s = (e) => {e.classList.add("show");e.classList.remove("hide")}
    if (content){
        settingsContentModal.innerHTML = content;
        h(settingsDefaultContentModal)
        s(settingsContentModal)
    }
    else{
        s(settingsDefaultContentModal)
        h(settingsContentModal)
    }
    elCurrentValue.value = currentValue

    modal.classList.add("show")
        setTimeout(() => {
        elCurrentValue.focus();
        elCurrentValue.select();
    }, 100);
    
    emsSave.onclick = () => {
        const d = {}
        d[keySad] = elCurrentValue.value
        saveManagerSettings(d)
    }
    // Save on Enter
    elCurrentValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') closeEditModal();
    });
}

function editCompanyName() {
    createEditModal("עדכן שם העסק", c_runtime.company.company_name, 'c_name');
}
function editCompanyDesciption(){createEditModal("עדכן תיאור לעסק", c_runtime.company.company_description)}
function editCompanyPhone(){createEditModal("עדכן פלאפון עסק", c_runtime.company.company_phone)}
function editCompanyEMail(){createEditModal("עדכן מייל ", c_runtime.company.company_email)}
function editCompanyVAT(){createEditModal("עדכן מספר עוסק", c_runtime.company.company_VAT)}
function editCompanyGPSE(){createEditModal("הגדרת חלוקת רווחים לעיסקה", c_runtime.company.gpse)}

async function saveManagerSettings(sad){
    const emsSave = document.getElementById("emsSave");
    emsSave.classList.add("loading")

    const data = {action:ApiCall.manager_settings, ...sad}
    const res = await apiPost(ApiRoute.api, data);
    const toast = showToast("מגדיר...");
    if (!res.success){
        showToast(res.notice, ToastStat.ERROR, toast);
    }else{
        showToast(res.notice, ToastStat.DONE, toast);
        closeEditModal()

    }
    emsSave.classList.remove('loading')

}
/**
 * Create a selector modal for tax status
 */
function createTaxStatusModal(currentValue, title) {
    const ttitle = 'סוג תיק עוסק'
    const html = `
        <div class="settings-tax-options">
            <div class="settings-tax-option ${currentValue === 'עוסק מורשה' ? 'active' : ''}" onclick="selectTaxStatus('עוסק מורשה', event)">
                <i class="fa-solid fa-check"></i>
                <div>
                    <span class="settings-tax-title">עוסק מורשה</span>
                    <span class="settings-tax-desc">חייב בתשלום מע"מ</span>
                </div>
            </div>
            <div class="settings-tax-option ${currentValue === 'עוסק פטור' ? 'active' : ''}" onclick="selectTaxStatus('עוסק פטור', event)">
                <i class="fa-solid fa-check"></i>
                <div>
                    <span class="settings-tax-title">עוסק פטור</span>
                    <span class="settings-tax-desc">פטור ממע"מ</span>
                </div>
            </div>
        </div>
    `;
    createEditModal(title, c_runtime.company.vat_company, null, {content:html})
}

function closeEditModal() {
    const modal = document.getElementById('settingsEditModal');
    modal.classList.remove("show")
    
}

/**
 * Select tax status option
 */
function selectTaxStatus(status, e) {
    selectedTaxStatus = status;
    const options = document.querySelectorAll('.settings-tax-option');
    options.forEach(opt => opt.classList.remove('active'));
    e.currentTarget.classList.add('active');
}

/**
 * Edit tax status
 */
function editVATOrNot() {
    createTaxStatusModal(null, 'בחר סוג עוסק');
}

/**
 * Toggle show ID on order
 */
function toggleShowIdOnOrder() {
    const checkbox = document.getElementById('showIdOnOrder');
    if (!checkbox) return;

    const isChecked = checkbox.checked;
    const toast = showToast("מעבד...");

    const apiData = {
        action: ApiCall.conf_company,
        c_show_id_on_order: isChecked ? 1 : 0
    };

    apiPost(ApiRoute.api, apiData)
        .then(res => {
            if (!res.success) {
                showToast(res.notice || 'שגיאה בשמירה', ToastStat.ERROR, toast);
                checkbox.checked = !isChecked;
                return;
            }

            showToast("עודכן בהצלחה!", ToastStat.DONE, toast);
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('שגיאת תקשורת', ToastStat.ERROR, toast);
            checkbox.checked = !isChecked;
        });
}
function setupEditHandlers() {
    const settingsPage = document.getElementById("SETTINGS");
    if (!settingsPage) return;

    // Logo upload
    const logoInput = document.getElementById("setLogo");
    if (logoInput) {
        logoInput.addEventListener("change", async () => {
            const file = logoInput.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('יש להעלות קובץ תמונה', ToastStat.ERROR);
                return;
            }

            if (file.size > c_settings.max_size_logo) {
                showToast('גודל הקובץ גדול מדי', ToastStat.ERROR);
                return;
            }

            const toast = showToast("מעלה תמונה...");
            try {
                await uploadImage(file, "nullptr", ApiUploadFile.LOGO);
                showToast("לוגו עודכן!", ToastStat.DONE, toast);
            } catch (err) {
                showToast('שגיאה בהעלאה', ToastStat.ERROR, toast);
            }
            logoInput.value = '';
        });
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await fetchMyManager();
    await fetchMyCompany();
    onLoadSetttings()
    setupEditHandlers()

});