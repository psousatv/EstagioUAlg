
class ObraGrafico {
    constructor(canvasId, codigoProcesso) {
        this.ctx = document.getElementById(canvasId);
        this.codigoProcesso = codigoProcesso;
        this.url = `../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=${codigoProcesso}`;

        this.labels = [];
        this.previstoAcumulado = [];
        this.realizadoAcumulado = [];
        this.previstoMensal = [];
        this.realizadoMensal = [];

        this.acumuladoPrevisto = 0;
        this.acumuladoRealizado = 0;

        this.chart = null;

        this.initChart();
        this.fetchData();
    }

    initChart() {
        this.chart = new Chart(this.ctx, {
            data: {
                labels: this.labels,
                datasets: [
                    { label: 'Previsto Acumulado', type: 'line', data: this.previstoAcumulado, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.15)', fill: true, tension: 0.3, yAxisID: 'y' },
                    { label: 'Realizado Acumulado', type: 'line', data: this.realizadoAcumulado, borderColor: 'rgba(0, 181, 204, 1)', backgroundColor: 'rgba(0, 181, 204, 0.15)', fill: true, tension: 0.3, yAxisID: 'y' },
                    { label: 'Previsto Mensal', type: 'bar', data: this.previstoMensal, backgroundColor: 'rgba(200,200,200,0.5)', yAxisID: 'y1' },
                    { label: 'Realizado Mensal', type: 'bar', data: this.realizadoMensal, backgroundColor: 'rgba(0,123,255,0.8)', yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Acumulado' } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Mensal' } },
                    x: { stacked: true }
                },
                plugins: { legend: { position: 'top' }, tooltip: { enabled: true } }
            }
        });
    }

    async fetchData() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) throw new Error(response.statusText);

            const data = await response.json();

            data.forEach(item => {
                this.labels.push(item.auto_num);

                this.acumuladoPrevisto += Number(item.valor_previsto);
                this.acumuladoRealizado += Number(item.valor_faturado);

                this.previstoAcumulado.push(this.acumuladoPrevisto);
                this.realizadoAcumulado.push(this.acumuladoRealizado);

                this.previstoMensal.push(Number(item.valor_previsto));
                this.realizadoMensal.push(Math.min(Number(item.valor_faturado), Number(item.valor_previsto)));
            });

            this.chart.update();
        } catch (error) {
            document.getElementById('lstErros').innerText = error.message;
        }
    }

    // Inicialização automática
    static initFromDOM(canvasId = 'lstObraGrafico') {
        document.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const codigoProcesso = params.get('codigoProcesso');
            if (!codigoProcesso) {
                console.error('Parâmetro "codigoProcesso" não encontrado na URL.');
                return;
            }

            new ObraGrafico(canvasId, codigoProcesso);
        });
    }
}

// Executa a inicialização automaticamente
ObraGrafico.initFromDOM();
