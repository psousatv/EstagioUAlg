
const ctx = document.getElementById('volumeChart');
          
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
              datasets: [
                {
                  label: 'Previsto',
                  data: [199, 210, 234, 347, 341, 341, 390, 227, 235, 227, 235],
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                  label: 'Faturado',
                  data: [220, 230, 50],
                  backgroundColor: 'rgba(75, 192, 192, 0.6)'
                },
                {
                  label: 'Realização (%)',
                  data: [110, 110, 77],
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
                  title: { display: true, text: 'Milhares de Euros' }
                },
                y1: {
                  position: 'right',
                  beginAtZero: true,
                  title: { display: true, text: '%' }
                }
              }
            }
          });