

const c_runtime = {
    items_ordered:{}
}

function viewclientDetails(client_id){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');
    CONFIG.CLIENT_VIEW =true;

    data = {action:ApiCall.client_view, ci:client_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('client-template')
            editBody.innerHTML = res.template;
        }
    )

}
function createClient(client_id=null){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');

    data = {action:ApiCall.client_editor, ci:client_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('client-template')
            editBody.innerHTML = res.template;
            
        }
    )
}



function closeCreateClient(no_api=false){
    const mainEdit = document.getElementById("client-editor")
    mainEdit.classList.remove("show")
    mainEdit.classList.add("hide")
    const client_id   = document.getElementById("the-client-card")?.dataset.ci;
   ( !no_api && (!CONFIG.CLIENT_EDIT && !CONFIG.CLIENT_VIEW))&& deleteClient(client_id)
   CONFIG.CLIENT_EDIT =false;
   CONFIG.CLIENT_VIEW =false;

}


function deleteClient(client_id){
    if (!confirm("continue?"))return;
    data = {ci:client_id, action:ApiCall.client_delete}
    console.log(data)
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(client_id)?.remove();

        }
    )

}



function addItemOrder() {
    const items = document.getElementById("items-ordered");

    const div = document.createElement("div");
    div.className = "ordered";
    div.id = items.childElementCount;

    const inputName = document.createElement("input");
    inputName.classList.add('c-input-item-name')
    inputName.id = `${div.id}-name`


    const inputPrice = document.createElement("input");
    inputPrice.classList.add('c-input-fn')
    inputPrice.id = `${div.id}-price`

    const trash = document.createElement('i')
    trash.classList = "fa-solid fa-trash-can trash-order"
    trash.onclick = ()=>{deleteItemOrder(div.id)}

    div.append(inputName, inputPrice, trash);
    items.appendChild(div);
    c_runtime.items_ordered[div.id] = {}
}

function deleteItemOrder(id_order){
    document.getElementById(id_order)?.remove()
    delete c_runtime.items_ordered[id_order]
}



function publishClient(client_id){
    const fullname = document.getElementById('fullname').value;
    const date = document.getElementById('client-date').value;
    const ldate = new Date(date);
    const time = document.getElementById('client-time').value;
    const [hours, minutes] = time.split(':').map(Number);
    ldate.setHours(hours, minutes, 0, 0);
    const timing = Math.floor(ldate.getTime() / 1000)
    const address = document.getElementById('client-location').value;
    const phone = document.getElementById('client-phone').value;
    const __items_ordered = document.getElementById('items-ordered').children.length;

    for (let i=1;i<__items_ordered;i++){
        var n = document.getElementById(i+'-name');
        var p = document.getElementById(i+'-price'); 
        c_runtime.items_ordered[i] = {name:n.value||n.textContent, price:parseInt((p.value||p.textContent).replace(/\D+/g, ''),10)}
    }
    const notes = document.getElementById('client-notes').value;
    const price = document.getElementById('client-price').value;
    const vat = Boolean(document.getElementById('client-vat').checked)
    const offPrice = document.getElementById('client-off-price').value;

    const data = {action:ApiCall.client_save,
        ci:client_id, s:StateClient.WAIT,
        phone:phone,o:Boolean(parseInt(offPrice)),
        op:offPrice,fn:fullname,
        address:address, i:JSON.stringify(c_runtime.items_ordered),
        lf:SocialMedia.WHATSAPP,date:timing,
        notes:notes,price:price,vat:vat
    }

    apiPost(ApiRoute.api,data).then(
        (res)=>{
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }
            closeCreateClient(true)
        }
    )

}


function editExistClient(client_id){
    CONFIG.CLIENT_EDIT = true;
    createClient(client_id)
}

