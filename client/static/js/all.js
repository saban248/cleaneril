let IS_MOBILE = window.matchMedia("(max-width: 768px)").matches;



function getIconByStatToast(stat){
    switch (stat){
        case ToastStat.DONE:
            return `fa-solid fa-circle-check tc-icon tci-${stat}`
        case ToastStat.LOAD:
            return `fa-solid fa-circle-notch fa-spin tc-icon tci-${stat}`;
        case ToastStat.ERROR:
            return `fa-solid fa-triangle-exclamation tc-icon tci-${stat}`
    }
}

function showToast(text, stat = ToastStat.LOAD, id=null){
    let toast = null;
    let icon = null;
    let head = null;
    let body = null;
    const __id = id || generateHex(4);
    if (!id){
        toast = document.createElement("div");
        toast.id = __id;
        toast.onclick = ()=>{
            toast.remove();
        }
        head = document.createElement("div")
        head.id = __id+'head';
        body = document.createElement("div")
        body.id = __id+'body'
        icon = document.createElement("i");
        icon.id = __id+'icon'
        toast.classList = "toast"
        head.classList = 'tc-head';
        body.classList = 'tc-body';

        toast.appendChild(head);
        toast.appendChild(body)
        head.appendChild(icon)
        document.getElementById("toast-container").appendChild(toast)

    }else{
        toast = document.getElementById(id)
        if (!toast){
            showToast(text, stat);
            return;
        }
        body = document.getElementById(id+'body');
        icon = document.getElementById(id+'icon')
    }

    icon.classList = getIconByStatToast(stat)
    body.innerText = text

    setTimeout(()=>{toast?.click()}, 6000)
    return __id;
}
function closeToast(id){
    document.getElementById(id)?.remove();
}



async function apiRequest(method, url, body = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json(); // auto parse JSON
    } catch (err) {
        console.error("API Error:", err);
        return { error: err.message };
    }
}


async function apiGet(url) {
    return apiRequest("GET", url);
}


async function apiPost(url, data) {
    return apiRequest("POST", url, data);
}


function generateHex(len = 16) {
    let result = "";
    const chars = "0123456789abcdef";

    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}



function rectMenu(menu, btn, menur){
    let top = btn.bottom + 6;
    let left = btn.left;

    // אם אין מקום למטה → תעלה למעלה
    if (btn.bottom + menur.height > window.innerHeight) {
        top = btn.top - menur.height - 6;
    }

    // אם יוצא ימינה → תיישר שמאלה
    if (btn.left + menur.width > window.innerWidth) {
        left = window.innerWidth - menur.width - 10;
    }

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;

}


async function geocodeAddressOSM(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!(data.length > 0)) {
        return [32.18,34.87]
    }
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}


function dateFloatToYMD(ts){
    const date = new Date(ts * 1000); // JS עובד עם milliseconds
    const formatted = date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
    });

    return formatted
}

function dateFloatToHour(ts){
    if (ts > 1e12) {
        ts = ts / 1000;
    }

    const date = new Date(ts * 1000);

    return date.toLocaleTimeString('he-IL', {
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function cleanPhoneJustNumbers(phone) {
  if (!phone) return '';

  phone = String(phone).replace(/[\u200E\u200F\u202A-\u202E]/g, '');
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('9720')) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('972')) {
    digits = '0' + digits.slice(3);
  }

  return digits;
}


function matchNumsWords(nums, str1, str2) {
  const words1 = (str1 || '').toLowerCase().split(/\s+/);
  const words2 = (str2 || '').toLowerCase().split(/\s+/);

  let count = 0;

  for (const w of words1) {
    if (words2.includes(w)) {
      count++;
      if (count >= nums) return true;
    }
  }

  return false;
}


window.addEventListener("resize", () => {
    IS_MOBILE = window.matchMedia("(max-width: 768px)").matches;
});