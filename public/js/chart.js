// Fetch the processed data and visualize it
fetch('/processed-data')
  .then(response => response.json())
  .then(data => {
    const labels = data.map((_, i) => `Timestep ${i + 1}`);
    const normalizedValues = data.map(d => d['normalized_feature']);

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Normalized Feature',
          data: normalizedValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  })
  .catch(error => console.error('Error fetching data:', error));
