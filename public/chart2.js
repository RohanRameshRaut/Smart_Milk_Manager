const ctx2 = document.getElementById('doughnut');

  new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: [
            'Purchase',
            'Sale'
          ],
          datasets: [{
            label: 'Milk',
            data: [400000, 780000],
            backgroundColor: [
              'Red',
              'Green'
            ],
            hoverOffset: 4
          }]
    }
  });