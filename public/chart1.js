const ctx = document.getElementById('lineChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Earnings in $',
      data: [500000, 550000, 620000, 625000, 612000, 750000, 630000, 618000, 575000, 606000, 578000, 595000],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true
  }
});