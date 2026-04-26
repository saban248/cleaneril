let chartReportsFunds;
let chartReportsOrders;

function initChartsFunds(monthlyIncome, monthlyCustomers) {
  chartReportsFunds = new ApexCharts(
    document.getElementById("chartReportsFunds"),
    chartFundsConfiguration()
  );
  chartReportsFunds.render()
}

const chartFundsConfiguration = () => {
  return {
    chart: {
      type: 'line',
      height: 350,
      stacked: false,
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent'
    },
    stroke: {
      width: [0, 4, 3, 3],
      curve: 'smooth',
      dashArray: [0, 0, 5, 5] // Added dash effect for average lines
    },
    plotOptions: {
      bar: { 
        borderRadius: 6,
        columnWidth: '65%',
        dataLabels: { position: 'top' }
      }
    },
    legend: { 
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      fontFamily: 'inherit',
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    series: [
      { name: 'הכנסות', type: 'column', data: [] },
      { name: 'הוצאות', type: 'line', data: [] },
      { name: 'ממוצע ר.פ.ל', type: 'line', data: [], visible: false },
      { name: 'ממוצע ה.פ.ל', type: 'line', data: [], visible: false }
    ],
    dataLabels: { 
      enabled: false, 
      formatter: val => val?.toLocaleString('he-IL')
    },
    labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: '12px', colors: '#64748b' }
      }
    },
    yaxis: [
      { 
        forceNiceScale: true, 
        labels: { 
          formatter: val => val?.toLocaleString('he-IL') + ' ₪',
          style: { colors: '#64748b' }
        }, 
        show: true 
      },
      { opposite: true, min: 0, forceNiceScale: true, show: false },
      { opposite: true, min: 0, forceNiceScale: true, show: false },
      { opposite: true, min: 0, forceNiceScale: true, show: false }
    ],
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      y: {
        formatter: val => val !== undefined ? val.toLocaleString('he-IL') + ' ₪' : val
      }
    },
    colors: ['#1c9548', '#3b82f6', '#9508ad', '#c7c41d'],
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { height: 300 },
          legend: { position: 'bottom', horizontalAlign: 'center' }
        }
      }
    ]
  };
};


function chartFundsUpdateSeries(monthlyIncome, monthlyExpenses, monthlyAIPCM, monthlyAEPCM) {
  chartReportsFunds.updateSeries([
    {
      name: 'הכנסות',
      type: 'column',
      data: monthlyIncome,
    },
    {
      name: 'הוצאות',
      type: 'line',
      data: monthlyExpenses,
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

function prepareMonthlyDataGraphFunds(transactions, year){
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);
  const monthlyAIPCM = Array(12).fill(0)
  const monthlyAEPCM = Array(12).fill(0)

  transactions.forEach(t => {
    const [y, m] = t.date.split("."); 

    if(Number(y) === Number(year)){
      const monthIndex = Number(m) - 1;

      monthlyIncome[monthIndex] += Number(t.amount);
      monthlyExpenses[monthIndex]+= Number(t.expense)
      monthlyAIPCM[monthIndex] = Number(t.average_income)
      monthlyAEPCM[monthIndex] = Number(t.average_expense)
    }
  });

  return { monthlyIncome, monthlyExpenses, monthlyAIPCM, monthlyAEPCM};
}



function initChartsOrders(){
  chartReportsOrders = new ApexCharts(
    document.getElementById("chartReportsOrders"),
    chartFundsConfiguration()
  );
  chartReportsOrders.render()
}



function chartOrdersUpdateSeries(monthlyIncome, monthlyExpenses, monthlyAIPCM, monthlyAEPCM) {
  chartReportsOrders.updateSeries([
    {
      name: 'הכנסות',
      type: 'column',
      data: monthlyIncome,
    },
    {
      name: 'הוצאות',
      type: 'line',
      data: monthlyExpenses,
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
