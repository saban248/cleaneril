

const CleanerILProducts = [
    {   
        orderType:CleanOrderType.AIR_CONDITIONER,
        title:"מזגן עילי",
        raw:'מזגן עילי 1.5 כ"ס מאייד+מאיץ+פילטרים',
        key:1,
        price:199
    },
        {   
        orderType:CleanOrderType.AIR_CONDITIONER,
        title:"מזגן עילי",
        raw:'מזגן עילי 2.5 כ"ס מאייד+מאיץ+פילטרים',
        key:2,
        price:199
    },
        {   
        orderType:CleanOrderType.AIR_CONDITIONER,
        title:"מזגן עילי",
        raw:'מזגן עילי 3.5 כ"ס מאייד+מאיץ+פילטרים',
        key:3,
        price:199
    },
    {   
        orderType:CleanOrderType.AIR_CONDITIONER,
        title:"מיני מרכזי",
        raw:'מיני מרכזי 4-6 כ"ס סוללה+פילטרים',
        key:5,
        price:400
    },
    {   
        orderType:CleanOrderType.AIR_CONDITIONER,
        title:"תעלות מיני מרכזי / מרכזי",
        raw:'תעלת מיזוג אוויר ס.שרשור ',
        key:9,
        price:200
    },
    {
        orderType:CleanOrderType.UPHOLSTERY,
        title:"ספה סוג בד רחיץ",
        raw:'ספה 2 מקומות ס.בד +כריות',
        key:6,
        price:200
    },
    {
        orderType:CleanOrderType.UPHOLSTERY,
        title:"ספה סוג בד רחיץ",
        raw:'ספה 3 מקומות ס.בד +כריות',
        key:7,
        price:300
    },
    {
        orderType:CleanOrderType.UPHOLSTERY,
        title:"ספה סוג בד רחיץ",
        raw:'ספה 2+3 מקומות ס.בד +כריות',
        key:8,
        price:360
    },



]



function getCILProductByKey(key){
    return c_runtime.products.find(p=>p.key==key)
}