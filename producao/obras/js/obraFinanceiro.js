var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso");
var url = '../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=' + codigoProcesso;

var resultados = [];
var containerCartoesAutos = document.getElementById('lstObraCartoes');
var containerGrauExecucao = document.getElementById('cartaoGrauExecucao');
var ctxGrafico = document.getElementById('lstObraGrafico');

var chart = null;

fetch(url)
    .then(response => response.json())
    .then(returnedData => {
        resultados = returnedData;

        renderCartoes(resultados);
        renderGrauExecucao(resultados);
        renderGrafico(resultados);
        initDataTable(resultados);
    })
    .catch(error => console.error("Erro ao carregar dados:", error));

// --------------------
// FUNÇÃO DE CARTÕES
// --------------------
function renderCartoes(data) {
    containerCartoesAutos.innerHTML = "";
    var previstoGlobal = [];

    data.forEach(resultado => {
        previstoGlobal.push(resultado["valor_previsto"]);

        var realizado = 0;
        if (resultado["valor_previsto"] == null) {
            realizado = 0;
        } else if (resultado["valor_faturado"] != 0 && resultado["valor_previsto"] != 0) {
            realizado = resultado["valor_faturado"] / resultado["valor_previsto"];
        }

        var classeCartao = '';
        var iconeCartao = '';

        if (resultado["valor_previsto"] == null) {
            classeCartao = 'bg-secondary text-white';
            iconeCartao = 'fa fa-refresh fa-spin';
        } else if (realizado < 0.40) {
            classeCartao = 'bg-danger text-white';
            iconeCartao = 'fa fa-thumbs-down';
        } else if (realizado >= 0.40 && realizado < 0.75) {
            classeCartao = 'bg-warning text-black';
            iconeCartao = 'fa fa-thumbs-down';
        } else if (realizado >= 0.75 && realizado < 0.90) {
            classeCartao = 'bg-primary text-white';
            iconeCartao = 'fa fa-cog fa-spin';
        } else if (realizado >= 0.90) {
            classeCartao = 'bg-success text-white';
            iconeCartao = 'fa fa-smile';
        }

        if (resultado["valor_faturado"] != 0) {
            containerCartoesAutos.innerHTML += `
                <div class="col-sm-6 col-md-4 mb-2">
                    <div class="card h-100 text-white ${classeCartao}" onclick="obraAuto('${codigoProcesso}', '${resultado["auto_num"]}')">
                        <div class="d-flex px-3 py-2">
                            <div class="flex-grow-1 text-left">
                                <p class="mb-0 font-weight-bold small">${resultado["documento"]} do auto n.º ${resultado["auto_num"]}</p>
                                <div>
                                    <h6 class="mb-1">
                                        ${Intl.NumberFormat("de-DE",{ style: "currency", currency: "EUR" }).format(resultado["valor_faturado"])} -
                                        <span>${Intl.NumberFormat("de-DE",{ style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(realizado)}</span>
                                    </h6>
                                </div>
                                <div>
                                    <h6 class="mb-0">
                                        ${Intl.NumberFormat("de-DE",{ style: "currency", currency: "EUR" }).format(resultado["valor_previsto"])}
                                    </h6>
                                </div>
                            </div>
                            <div class="pl-2 mt-auto">
                                <i class="fas ${iconeCartao} fa-3x text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

// --------------------
// FUNÇÃO GRAU DE EXECUÇÃO
// --------------------
function renderGrauExecucao(data) {
    var faturado = [];
    var previsto = [];
    var previstoGlobal = data.map(r => r["valor_previsto"]);

    data.forEach(r => {
        if (r["valor_faturado"] != 0) {
            faturado.push(Number(r["valor_faturado"]));
            previsto.push(Number(r["valor_previsto"]));
        }
    });

    var totalFaturado = faturado.reduce((s, a) => s + a, 0);
    var totalPrevisto = previsto.reduce((s, a) => s + a, 0);
    var totalObra = previstoGlobal.reduce((s, a) => s + a, 0);

    var grauExecucaoRealizado = totalPrevisto ? ((totalFaturado / totalPrevisto) * 100).toFixed(2) : 0;
    var grauExecucaoGlobal = totalObra ? ((totalFaturado / totalObra) * 100).toFixed(2) : 0;

    var autos = faturado.length;

    containerGrauExecucao.innerHTML = `
        <div class="col col-md-4">
            <div class="bg-primary text-white rounded">
                <p class="text-center">Grau de Execução até ao auto n.º ${autos}</p>
                <h3 class="text-center">${Number(grauExecucaoRealizado).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</h3>
                <h6 class="text-center">
                    Faturado: ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalFaturado)} 
                    de ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalPrevisto)}
                </h6>
            </div>
        </div>
        <div class="col col-md-4">
            <div class="bg-secondary text-white rounded">
                <p class="text-center">Grau de Execução Global</p>
                <h3 class="text-center">${Number(grauExecucaoGlobal).toLocaleString('de-DE')}%</h3>
                <h6 class="text-center">
                    Faturado: ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalFaturado)}
                    de ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalObra)}
                </h6>
            </div>
        </div>
    `;
}

// --------------------
// FUNÇÃO GRÁFICO
// --------------------
function renderGrafico(data) {
    var labels = [];
    var previstoMensal = [];
    var realizadoMensal = [];
    var previstoAcumulado = [];
    var realizadoAcumulado = [];
    var accPrevisto = 0;
    var accRealizado = 0;

    // filtrar apenas realizados e ordenar por ano/mes
    var realizados = data
        .filter(r => Number(r.valor_faturado) > 0)
        .sort((a, b) => (a.ano*100 + a.mes_realizado) - (b.ano*100 + b.mes_realizado));

    realizados.forEach(r => {
        labels.push(`${r.mes_realizado}/${r.ano}`);
        accPrevisto += Number(r.valor_previsto);
        accRealizado += Number(r.valor_faturado);
        previstoAcumulado.push(accPrevisto);
        realizadoAcumulado.push(accRealizado);
        previstoMensal.push(Number(r.valor_previsto));
        realizadoMensal.push(Number(r.valor_faturado));
    });

    if(chart) chart.destroy();

    chart = new Chart(ctxGrafico, {
        data: {
            labels: labels,
            datasets: [
                { label: 'Previsto Acumulado', type: 'line', data: previstoAcumulado, borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.15)', fill: true, tension: 0.3, yAxisID: 'y' },
                { label: 'Realizado Acumulado', type: 'line', data: realizadoAcumulado, borderColor: 'rgba(0,181,204,1)', backgroundColor: 'rgba(0,181,204,0.15)', fill: true, tension: 0.3, yAxisID: 'y' },
                { label: 'Previsto Mensal', type: 'bar', data: previstoMensal, backgroundColor: 'rgba(200,200,200,0.5)', yAxisID: 'y1' },
                { label: 'Realizado Mensal', type: 'bar', data: realizadoMensal, backgroundColor: 'rgba(0,123,255,0.8)', yAxisID: 'y1' }
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

// --------------------
// FUNÇÃO EXISTENTE PARA ABRIR AUTO
// --------------------
function obraAuto(codigoProcesso, auto) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("lstAuto").innerHTML = this.responseText;
        }
    };
    var urlAuto = "dados/obraMapaSituacaoAuto.php?codigoProcesso=" + codigoProcesso + "&auto=" + auto;
    xmlhttp.open("GET", urlAuto, true);
    xmlhttp.send();
}
