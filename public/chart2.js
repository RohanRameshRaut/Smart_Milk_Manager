const ctx2 = document.getElementById('doughnut');
  // Fetch data from the backend and initialize the chart
  fetch('/home/milk-data')
  .then(response => response.json())
  .then(data => {
      const ctx2 = document.getElementById('doughnut').getContext('2d');
      
      new Chart(ctx2, {
          type: 'pie',
          data: {
              labels: ['Purchase', 'Sale'],
              datasets: [{
                  label: 'Milk',
                  data: [data.purchase, data.sale],
                  backgroundColor: ['Red', 'Green'],
                  hoverOffset: 4
              }]
          }
      });
  })
  .catch(error => {
      console.error('Error fetching chart data:', error);
  });