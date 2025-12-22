



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

    const client_id   = document.getElementById("the-client").dataset.ci;
   ( !no_api && !CONFIG.CLIENT_EDIT)&& deleteClient(client_id)
   CONFIG.CLIENT_EDIT =false;

}


function deleteClient(client_id){
    // if (!!confirm("continue?"))return;
    data = {ci:client_id, action:ApiCall.client_delete}
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(client_id)?.remove();

        }
    )

}
