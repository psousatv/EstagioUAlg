document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigoProcesso = params.get("codigoProcesso");
    const url = "../obras/dados/obraMetricas.php?codigoProcesso=" + codigoProcesso;

    fetchMetricas(url);
});

// ---------------------------------------------------------------
// 1) Buscar dados
// ---------------------------------------------------------------
function fetchMetricas(url) {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data && data.length > 0) {
                obraMetricas = data;
                renderProgressBars(obraMetricas);   // Renderiza as barras de progresso
                gerarGraficoLadoALado(obraMetricas); // Gera o gráfico lado a lado
            } else {
                document.getElementById("lstMetricasProgress").innerHTML =
                    `<div class="text-warning">Nenhum dado encontrado para as métricas.</div>`;
                document.getElementById("lstMetricasGrafico").innerHTML = 
                    `<div class="text-warning">Nenhum gráfico disponível.</div>`;
            }
        })
        .catch(err => {
            document.getElementById("lstMetricasProgress").innerHTML =
                `<div class="text-danger">Erro ao carregar as métricas: ${err}</div>`;
            document.getElementById("lstMetricasGrafico").innerHTML = 
                `<div class="text-danger">Erro ao carregar o gráfico: ${err}</div>`;
        });
}

// ---------------------------------------------------------------
// 2) Renderizar tudo (barras + gráfico)
// ---------------------------------------------------------------
function renderProgressBars(metricas) {
    const container = document.getElementById("lstMetricasProgress");
    container.innerHTML = "";

    metricas.forEach(m => {
        // Verifica se os dados são válidos
        const valor = {
            titulo: m.trabalho,
            proposto: m.valor_proposto || 0,  // Garantir valores numéricos
            executado: m.valor_trabalhos || 0,  // Garantir valores numéricos
            percentagem: m.percentagem || 0  // Garantir valores numéricos
        };
        container.appendChild(createProgressBar(valor));
    });
}

// ---------------------------------------------------------------
// 3) Componente Progress Bar animado (retorna um <div> pronto)
// ---------------------------------------------------------------
function createProgressBar({ titulo, percentagem }) {
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";

    wrapper.innerHTML = `
        <small class="fw-bold">${titulo}</small>
        <div class="progress mt-1" style="height:22px">
            <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                 role="progressbar"
                 style="width:0%"
                 data-target="${percentagem}">
                 <span class="ms-2 fw-bold">${percentagem}%</span>
            </div>
        </div>
    `;

    animateProgressBar(wrapper.querySelector(".progress-bar"));
    return wrapper;
}

// ---------------------------------------------------------------
// 4) Animação suave da barra
// ---------------------------------------------------------------
function animateProgressBar(bar) {
    let current = 0;
    const target = Number(bar.dataset.target);

    const interval = setInterval(() => {
        if (current >= target) return clearInterval(interval);
        current++;
        bar.style.width = current + "%";
    }, 10);
}

// ---------------------------------------------------------------
// 5) Gerar gráfico de barras lado a lado com base nos dados de metricas
// ---------------------------------------------------------------
function gerarGraficoLadoALado(metricas) {
    const ctx = document.getElementById("lstMetricasGrafico").getContext("2d");

    // Extrair dados e garantir que não sejam nulos
    const labels = metricas.map(m => m.trabalho || 'Desconhecido');
    const proposto = metricas.map(m => Number(m.valor_proposto || 0));
    const executado = metricas.map(m => Number(m.valor_trabalhos || 0));

    // Determinar cores dinâmicas para "Executado"
    const coresExecutado = metricas.map((m, i) => {
        const perc = (executado[i] / proposto[i]) * 100;
        if (perc >= 80) return "rgba(0, 200, 0, 0.8)";       // verde
        if (perc >= 50) return "rgba(255, 193, 7, 0.8)";     // amarelo
        return "rgba(220, 53, 69, 0.8)";                     // vermelho
    });

    // Destruir gráfico antigo se existir
    if (window.metricasChart) window.metricasChart.destroy();

    // Criar gráfico de barras lado a lado
    window.metricasChart = new Chart(ctx, {
        type: "bar",  // Tipo de gráfico: barras
        data: {
            labels: labels,  // Labels para as barras
            datasets: [
                {
                    label: "Proposto (€)",
                    data: proposto,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",  // Cor das barras do proposto
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                },
                {
                    label: "Executado (€)",
                    data: executado,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",  // Cor das barras do executado
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,  // Tornar o gráfico responsivo
            maintainAspectRatio: false,  // Não manter a proporção fixa
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.dataset.label + ": " + ctx.raw.toLocaleString("pt-PT", { style: 'currency', currency: 'EUR' })
                    }
                },
                legend: { position: 'top' }  // Posição da legenda
            },
            scales: {
                x: {
                    stacked: false,  // Desmarcar stacked para exibir as barras lado a lado
                },
                y: {
                    stacked: false,  // Desmarcar stacked para as barras no eixo Y também
                    beginAtZero: true,  // Começar o eixo Y do zero
                    ticks: {
                        callback: value => value.toLocaleString("pt-PT", { style: 'currency', currency: 'EUR' })  // Formatar o eixo Y como moeda
                    }
                }
            }
        }
    });
}
