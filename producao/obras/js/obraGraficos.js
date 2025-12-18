// Pega o parâmetro da URL
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = '../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=' + codigoProcesso;

// Arrays para dados do gráfico
var resultado = [];
var labelsGrafico = [];
var xPrevistoAcumulado = [];
var xRealizadoAcumulado = [];
var xPrevistoMensal = [];
var xRealizadoMensal = [];

var acumuladoPrevisto = 0;
var acumuladoRealizado = 0;

// Inicializa o gráfico vazio
var ctx = document.getElementById('lstObraGrafico');

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labelsGrafico,
        datasets: [
            {
                label: 'Previsto Acumulado',
                type: 'line',
                data: xPrevistoAcumulado,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: true,
                yAxisID: 'y'
            },
            {
                label: 'Realizado Acumulado',
                type: 'line',
                data: xRealizadoAcumulado,
                borderColor: 'rgba(0, 181, 204, 1)',
                backgroundColor: 'rgba(0, 181, 204, 0.1)',
                fill: true,
                yAxisID: 'y'
            },
            {
                label: 'Previsto Mensal',
                type: 'bar',
                data: xPrevistoMensal,
                backgroundColor: 'rgba(200, 200, 200, 0.4)',
                borderColor: 'rgba(2000, 2000, 200, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            },
            {
                label: 'Realizado Mensal',
                type: 'bar',
                data: xRealizadoMensal,
                backgroundColor: 'rgba(0, 123, 255, 0.8)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Acumulado'
                }
            },
            y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false
                },
                title: {
                    display: true,
                    text: 'Mensal'
                },
                stacked: false  // Ativando o empilhamento no eixo y1 (secundário)
            },
            x: {
                stacked: true  // Empilhando as barras no eixo X
            }
        },
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    }
});


// Função para buscar dados via fetch
fetchData();

function fetchData() {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            resultado.push(...data);

            resultado.forEach(item => {
                labelsGrafico.push(item.auto_num);

                // Acumulados
                acumuladoPrevisto += parseFloat(item.valor_previsto);
                acumuladoRealizado += parseFloat(item.valor_faturado);

                xPrevistoAcumulado.push(acumuladoPrevisto);
                xRealizadoAcumulado.push(acumuladoRealizado);

                // Valores mensais
                xPrevistoMensal.push(parseFloat(item.valor_previsto));
                xRealizadoMensal.push(
                    Math.min(parseFloat(item.valor_faturado), parseFloat(item.valor_previsto))
                );
            });

            myChart.update();
        })
        .catch(error => {
            document.getElementById('lstErros').innerHTML = error.message;
        });
};
