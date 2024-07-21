// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function () {
  fetchMilkDataAndRenderChart();
});

function fetchMilkDataAndRenderChart() {
  fetch('/inventory/milkData') // Endpoint to fetch milk data
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          const labels = data.map(item => item.type);
          const values = data.map(item => item.quantity);
          const backgroundColors = ['aqua', 'yellow', 'red']; // Customize if needed

          const ctx2 = document.getElementById('doughnut');
          new Chart(ctx2, {
              type: 'pie',
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Milk',
                      data: values,
                      backgroundColor: backgroundColors,
                      hoverOffset: 4
                  }]
              }
          });
      })
      .catch(error => {
          console.error('Error fetching milk data:', error);
      });
}
