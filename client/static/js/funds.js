




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

document.addEventListener("DOMContentLoaded", function () {
    initChartsFunds()
});
document.addEventListener("click", e => {
    const menu = document.getElementById("yearFundsMenu")
    if (!menu.contains(e.target) && !e.target.classList.contains("year-select")) {
        menu.classList.remove("show")
    }
})