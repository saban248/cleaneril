function openPopup(title = "", message = "") {
    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMessage").textContent = message;
    document.getElementById("popupOverlay").classList.remove("hidden");
}

function closePopup() {
    document.getElementById("popupOverlay").classList.add("hidden");
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