class ManagerCache{

    static create_cache(){
        if (ManagerCache.exist())return;
            localStorage.setItem("exist",'1')
    }
    static managerPage(){
        const page =  localStorage.getItem("MANAGER_PAGE")
        if (!page)return -1;
        return parseInt(page)
    }
    static setManagerPage(tab){
        if (!ManagerCache.exist())return
        localStorage.setItem("MANAGER_PAGE", tab);
    }
    static exist(){
        return Boolean(localStorage.getItem("exist"));
    }

}



ManagerCache.create_cache()