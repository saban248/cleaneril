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
    static setFundsChartsYear(year){
        const key = "FUNDS_CHARTS";
        if (!localStorage.getItem(key)){
            localStorage.setItem(key, "{}")
        }
        const funds_charts = localStorage.getItem(key)
        const data = JSON.parse(funds_charts)
        data.year = year
        localStorage.setItem(key, JSON.stringify(data))
        
    }
    static getFundsChartsYear(){
        const key = "FUNDS_CHARTS";
        const data = localStorage.getItem(key)
        if (data == undefined || data == '{}'){return 2026}
        return JSON.parse(data).year
    }
    static setClientsSortedState(state){
        const key = "state_client"
        localStorage.setItem(key, state)
    }
    static getClientsSortedState(){
        const key = "state_client"
        const data = localStorage.getItem(key)
        if (data == undefined || data == null)return 0
        return parseInt(data, 10)
    }
    static setClientsCalender(c){
        const key = "calender_client"
        localStorage.setItem(key, c)

    }
    static getClientsCalender(){
        const key = "calender_client"
        const data = localStorage.getItem(key)
        if (data == null){
            return CalanderClients.FOREVER
        }
        return data
    }

    static exist(){
        return Boolean(localStorage.getItem("exist"));
    }

}



ManagerCache.create_cache()