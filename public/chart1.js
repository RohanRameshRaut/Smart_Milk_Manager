const ctx = document.getElementById('lineChart').getContext('2d');

fetch('/home/earnings')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: data.labels,
              datasets: [{
                  label: 'Earnings in Rs.',
                  data: data.data,
                  borderWidth: 1,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: true
              }]
          },
          options: {
              responsive: true,
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  })
  .catch(error => console.error('Error fetching data:', error));