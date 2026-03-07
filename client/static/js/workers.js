


function createEmployee(worker_id=null){
    const mainEdit = document.getElementById("worker-editor")
    mainEdit.classList.remove('hide');
    mainEdit.classList.add('show');

    data = {action:ApiCall.worker_editor, wi:worker_id}
    apiPost(ApiRoute.api, data).then(
        (res) => {
            if (!res.success){
                openPopup(res.title, res.notice)
                return
            }

            const editBody = document.getElementById('worker-template')
            editBody.innerHTML = res.template;
            if (CONFIG.WORKER_EDIT){
            }
            
        }
    )
    
}


function closeCreateWorker(no_api=false){
    const mainEdit = document.getElementById("worker-editor")
    mainEdit.classList.remove("show")
    mainEdit.classList.add("hide")
    const worker_id   = document.getElementById("the-worker-card")?.dataset.ci;
   ( !no_api && (!CONFIG.WORKER_EDIT && !CONFIG.WORKER_VIEW))&& deleteWorker(worker_id)
   CONFIG.WORKER_EDIT = false;
   CONFIG.WORKER_VIEW = false;
}



function deleteWorker(worker_id){
    if (!confirm("continue?"))return;
    data = {wid:worker_id, action:ApiCall.worker_delete}
    console.log(data)
    apiPost(ApiRoute.api,data).then(
        (res) =>{
            if (!res.success || res.deleted){
                return
            }
            document.getElementById(worker_id)?.remove();

        }
    )
}