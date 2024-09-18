// Fetch the processed data and visualize it
fetch('/processed-data')
  .then(response => {
    // Check if response is OK
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Return the parsed JSON data
  })
  .then(data => {
    console.log(data); // Log the actual data

    const labels = data.map((_, i) => `${i + 1}`);
    const normalizedValues = data.map(d => d['normalized_Hours_Studied']);

    // Ensure 'myChart' element exists in the DOM
    const ctx = document.getElementById('myChart');
    if (ctx) {
      const chartCtx = ctx.getContext('2d');
      new Chart(chartCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Normalized_Hours_Studied',
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
    } else {
      console.error('Chart context not found');
    }
  })
  .catch(error => console.error('Error fetching data:', error));
