
const ctx = document.getElementById('volumeChart');
          
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
              datasets: [
                {
                  label: 'Volume Captado',
                  data: [120, 130, 125, 140, 135, 150],
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                  label: 'Volume Faturado',
                  data: [90, 95, 92, 100, 98, 105],
                  backgroundColor: 'rgba(75, 192, 192, 0.6)'
                },
                {
                  label: 'Perdas (%)',
                  data: [25, 27, 26, 29, 28, 30],
                  type: 'line',
                  borderColor: 'red',
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Volume' }
                },
                y1: {
                  position: 'right',
                  beginAtZero: true,
                  title: { display: true, text: '%' }
                }
              }
            }
          });