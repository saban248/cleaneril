
/**
 * Settings Page - Instagram-style Design
 * Enhanced with smooth animations and better UX
 */

let editingField = null;
let selectedTaxStatus = null;

function setLogo() {
    const input = document.getElementById("setLogo");
    input.click();
}

const c_settings = {
    
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
function createEditModal(title, currentValue) {
    // Remove existing modal if any
    const modal = document.getElementById("settingsEditModal");
    const elTitle = document.getElementById("emsTitle");
    const lastValue = document.getElementById("emsLastValue");
    const elCurrentValue = document.getElementById("emsCurrentValue");
    elTitle.textContent = title
    elCurrentValue.value = currentValue
    modal.classList.add("show")
        setTimeout(() => {
        elCurrentValue.focus();
        elCurrentValue.select();
    }, 100);
    
    // Save on Enter
    elCurrentValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEditField(field);
        if (e.key === 'Escape') closeEditModal();
    });
}

function editCompanyName() {createEditModal("עדכן שם העסק", c_runtime.company.company_name);}
function editCompanyDesciption(){createEditModal("עדכן תיאור לעסק", c_runtime.company.company_description)}
function editCompanyPhone(){createEditModal("עדכן פלאפון עסק", c_runtime.company.company_phone)}
function editCompanyEMail(){createEditModal("עדכן מייל ", c_runtime.company.company_email)}
function editCompanyVAT(){createEditModal("עדכן מספר עוסק", c_runtime.company.company_VAT)}
function editCompanyGPSE(){createEditModal("הגדרת חלוקת רווחים לעיסקה", c_runtime.company.gpse)}
/**
 * Create a selector modal for tax status
 */
function createTaxStatusModal(currentValue, title) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.settings-edit-modal');
    if (existingModal) existingModal.remove();

    selectedTaxStatus = currentValue;

    const modal = document.createElement('div');
    modal.className = 'settings-edit-modal';
    modal.innerHTML = `
        <div class="settings-modal-overlay"></div>
        <div class="settings-modal-content">
            <div class="settings-modal-header">
                <h5>${title}</h5>
                <i class="fa-solid fa-times" onclick="closeEditModal()"></i>
            </div>
            <div class="settings-tax-options">
                <div class="settings-tax-option ${currentValue === 'עוסק מורשה' ? 'active' : ''}" onclick="selectTaxStatus('עוסק מורשה', event)">
                    <i class="fa-solid fa-check"></i>
                    <div>
                        <span class="settings-tax-title">עוסק מורשה</span>
                        <span class="settings-tax-desc">חייב בתשלום מס</span>
                    </div>
                </div>
                <div class="settings-tax-option ${currentValue === 'עוסק פטור' ? 'active' : ''}" onclick="selectTaxStatus('עוסק פטור', event)">
                    <i class="fa-solid fa-check"></i>
                    <div>
                        <span class="settings-tax-title">עוסק פטור</span>
                        <span class="settings-tax-desc">פטור ממס הוספה</span>
                    </div>
                </div>
            </div>
            <div class="settings-modal-footer">
                <button class="settings-btn-cancel" onclick="closeEditModal()">ביטול</button>
                <button class="settings-btn-save" onclick="saveTaxStatus()">שמור</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    editingField = 'tax_status';
}

function closeEditModal() {
    const modal = document.querySelector('settingsEditModal');
    modal.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(() => modal.classList.remove("show"), 300);
    
}

/**
 * Save edited field
 */
function saveEditField(field) {
    const input = document.getElementById('modalInput');
    if (!input) return;

    const value = input.value.trim();

    // Validate based on field type
    if (!validateField(field, value)) {
        showToast('ערך לא חוקי', ToastStat.ERROR);
        input.focus();
        return;
    }

    closeEditModal();
    const toast = showToast("מעבד...");

    const apiData = {
        action: ApiCall.conf_company,
        ...getFieldApiData(field, value)
    };

    apiPost(ApiRoute.api, apiData)
        .then(res => {
            if (!res.success) {
                showToast(res.notice || 'שגיאה בשמירה', ToastStat.ERROR, toast);
                return;
            }

            // Update display
            updateFieldDisplay(field, value);
            showToast("עודכן בהצלחה!", ToastStat.DONE, toast);
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('שגיאת תקשורת', ToastStat.ERROR, toast);
        });
}

/**
 * Update field display value
 */
function updateFieldDisplay(field, value) {
    const fieldMap = {
        'company_name': 'nameCompanyView',
        'company_description': 'descCompanyView',
        'company_phone': 'phoneCompanyView',
        'company_email': 'emailCompanyView',
        'company_vat': 'VATCompanyView',
        'gpse': 'GPSECompanyView',
        'tax_status': 'taxStatusView'
    };

    const viewId = fieldMap[field];
    if (viewId) {
        const element = document.getElementById(viewId);
        if (element) {
            element.textContent = field === 'gpse' ? value + '%' : value;
        } else {
            console.warn(`Element with ID ${viewId} not found`);
        }
    }
}

/**
 * Get field validation rules
 */
function validateField(field, value) {
    const rules = {
        company_name: () => value.length > 0 && value.length <= 20,
        company_description: () => value.length <= 50,
        company_phone: () => /^[\d\s\-+()]*$/.test(value),
        company_email: () => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        company_vat: () => value.length >= 0,
        gpse: () => {
            const num = parseInt(value);
            return !isNaN(num) && num >= 0 && num <= 100;
        }
    };

    return rules[field] ? rules[field]() : true;
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
 * Save tax status
 */
function saveTaxStatus() {
    if (!selectedTaxStatus) {
        showToast('בחר סוג עוסק', ToastStat.ERROR);
        return;
    }
    
    closeEditModal();
    const toast = showToast("מעבד...");

    const apiData = {
        action: ApiCall.conf_company,
        c_tax_status: selectedTaxStatus
    };

    apiPost(ApiRoute.api, apiData)
        .then(res => {
            if (!res.success) {
                showToast(res.notice || 'שגיאה בשמירה', ToastStat.ERROR, toast);
                return;
            }

            updateFieldDisplay('tax_status', selectedTaxStatus);
            showToast("עודכן בהצלחה!", ToastStat.DONE, toast);
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('שגיאת תקשורת', ToastStat.ERROR, toast);
        });
}
function getFieldApiData(field, value) {
    const map = {
        company_name: { c_name: value },
        company_description: { c_desc: value },
        company_phone: { c_phone: value },
        company_email: { c_email: value },
        company_vat: { c_vat_code: value },
        gpse: { c_gpse: value.replace(/\D+/g, '') },
        tax_status: { c_tax_status: value }
    };

    return map[field] || {};
}

/**
 * Edit tax status
 */
function editTaxStatus() {
    const element = document.getElementById('taxStatusView');
    if (!element) {
        showToast('שגיאה בטעינת הנתונים', ToastStat.ERROR);
        return;
    }
    const value = element.textContent.trim();
    createTaxStatusModal(value, 'בחר סוג עוסק');
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

            if (file.size > 5 * 1024 * 1024) {
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