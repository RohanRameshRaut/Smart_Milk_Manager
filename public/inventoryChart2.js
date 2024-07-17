const ctx2 = document.getElementById('doughnut');

  new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: [
            'BUFFELO MILK',
            'COW MILK',
            'A2 MILK'
          ],
          datasets: [{
            label: 'Milk',
            data: [50000, 35000, 15000],
            backgroundColor: [
              'aqua',
              'yellow',
              'red'
            ],
            hoverOffset: 4
          }]
    }
  });