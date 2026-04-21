let chartClientIncome;

function initCharts(monthlyIncome, monthlyCustomers) {
  chartClientIncome = new ApexCharts(
    document.querySelector("#chartClientIncome"),
    options(monthlyIncome, monthlyCustomers)
  );
  chartClientIncome.render()
}

function updateChartClientIncome(monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM) {
  chartClientIncome.updateSeries([
    {
      name: 'הכנסות',
      type: 'column',
      data: monthlyIncome,
    },
    {
      name: 'לקוחות',
      type: 'line',
      data: monthlyCustomers,
    },
    {
      name: 'ממוצע ר.פ.ל',
      type: 'line',
      data: monthlyAIPCM,
      visible: false
    },
    {
      name: 'ממוצע ה.פ.ל',
      type: 'line',
      data: monthlyAEPCM,
      visible: false
    }
  ]);
}




function formatNumber(num) {
  return num.toLocaleString('he-IL'); // 6,500
}

function updateUI(selector, value, icon = '₪') {
  document.getElementById(selector).innerText = formatNumber(value) + ` ${icon}`;
}

function setIncome(amount) {
  updateUI("incomeTotal", amount);
}

function setExpense(amount) {
  updateUI("expenseTotal", amount);
}

function setProfit(amount) {
  updateUI("profitTotal", amount);
}

function setAveragePPC(amount){
  updateUI("averageProfitPerClient", amount)
}

function setAverageEPC(amount){
  updateUI("averageExpensePerClient", amount)
}

function setTotalDoneClient(amount){
  updateUI("totalDoneclient", amount, "")
}

function updateInExPrAndChartClientAndIncome(year){
    if (!year){
        year = ManagerCache.getFundsChartsYear()
    }
    data = {action:ApiCall.funds_income, year:year}
    apiPost(ApiRoute.api, data).then(
        (res) =>{
            if (!res.success){
                showToast(res.notice, ToastStat.ERROR);
                return;
            }
            const {monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM} = prepareMonthlyData(res.data, year);
            
            updateChartClientIncome(monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM)

            setIncome(res.in)
            setExpense(res.ex)
            setProfit(res.pr)
            setAveragePPC(res.ave_ipc_ever)
            setAverageEPC(res.ave_epc_ever)
            setTotalDoneClient(res.total_client)
            document.getElementById("selectedYear").innerText = year;
            ManagerCache.setFundsChartsYear(year)


        }
    )
}




function prepareMonthlyData(transactions, year){
  const monthlyIncome = Array(12).fill(0);
  const monthlyCustomers = Array(12).fill(0);
  const monthlyAIPCM = Array(12).fill(0)
  const monthlyAEPCM = Array(12).fill(0)

  transactions.forEach(t => {
    const [y, m] = t.date.split("."); 

    if(Number(y) === Number(year)){
      const monthIndex = Number(m) - 1;

      monthlyIncome[monthIndex] += Number(t.amount);
      monthlyCustomers[monthIndex] += 1;
      monthlyAIPCM[monthIndex] = Number(t.ave_ipcm)
      monthlyAEPCM[monthIndex] = Number(t.ave_epcm)
    }
  });

  return { monthlyIncome, monthlyCustomers, monthlyAIPCM, monthlyAEPCM};
}


const options = (monthlyIncome, monthlyCustomers, monthlyAIPCM)=> {return{
    chart: {
    type: 'line',
    height: 350,
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: true },
  },
  stroke: {
    width: [0, 4]
  },
  plotOptions: {
    bar: { borderRadius: 8 }
  },
  legend: { position: 'top',horizontalAlign: 'right'},
  series: [
    {
      name: 'הכנסות',
      type: 'column',
      data: monthlyIncome
    },
    {
      name: 'לקוחות',
      type: 'line',
      data: monthlyCustomers
    },
    {
      name: 'ממוצע ר.פ.ל',
      type: 'line',
      data: monthlyAIPCM,
      visible:false
    },
    {
      name: 'ממוצע ה.פ.ל',
      type: 'line',
      data: [],
      visible:false
    }
  ],
  dataLabels: { enabled: false, formatter: val => val.toLocaleString('he-IL')},
  labels: ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],
  yaxis: [
    { forceNiceScale: true, labels: { formatter: val => val?.toLocaleString('he-IL') }, show:true},
    { opposite: true, min: 0, forceNiceScale: true, show:false},
    { opposite: true, min: 0, forceNiceScale: true, show:false, labels: { formatter: val => val?.toLocaleString('he-IL') +"₪" }},
    { opposite: true, min: 0, forceNiceScale: true, show:false, labels: { formatter: val => val?.toLocaleString('he-IL') +"₪" }}
  ],
  tooltip: {
    shared: true,
    intersect: false
  },
  colors: ['#1c9548', '#3b82f6','#9508ad', '#c7c41d'],
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: { height: 300 },
        legend: { position: 'top' }
      }
    }
  ]
}};



const yearsItems = [
    { text: "2024", action: (y) => selectYearCharts(y), icon:'<i class="fa-solid fa-calendar-days"></i>'},
    { text: "2025", action: (y) => selectYearCharts(y), icon:'<i class="fa-solid fa-calendar-days"></i>'},
    { text: "2026", action: (y) => selectYearCharts(y), icon:'<i class="fa-solid fa-calendar-days"></i>'},
    { text: "2027", action: (y) => selectYearCharts(y), icon:'<i class="fa-solid fa-calendar-days"></i>'},
]
function openMenuSelectYear(t){
    const menu = document.getElementById("yearFundsMenu")

    if (menu.classList.contains("show")) {
        menu.classList.remove("show")
        return
    }
    const rect = t.getBoundingClientRect()
    menu.innerHTML = "" // ניקוי

    yearsItems.forEach(item => {
        let cma = document.createElement("div")
        cma.className = "cma"
        let cma1 = document.createElement('div')
        cma1.className = "cma1"
        cma1.innerHTML = item.icon
        
        let cma2 = document.createElement("div")
        cma2.className = 'cma2'
        cma2.textContent = item.text
        cma.appendChild(cma1)
        cma.appendChild(cma2)

        cma.onclick = () => {
            item.action(item.text)
            menu.classList.remove("show")
        }
        menu.appendChild(cma)
    })

    menu.style.top = `${rect.bottom + window.scrollY + 6}px`
    menu.style.left = `${rect.left + window.scrollX}px`

    menu.classList.add("show")
}

function selectYearCharts(y){
    updateInExPrAndChartClientAndIncome(y)

}

// document.addEventListener("DOMContentLoaded", function () {
//     initCharts()
//   updateInExPrAndChartClientAndIncome(ManagerCache.getFundsChartsYear())
// });
// document.addEventListener("click", e => {
//     const menu = document.getElementById("yearFundsMenu")
//     if (!menu.contains(e.target) && !e.target.classList.contains("year-select")) {
//         menu.classList.remove("show")
//     }
// })