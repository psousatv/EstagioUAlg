
window.ProcessoObra = (() => {

    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const formatMoeda = Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

    // ---------------- Financeiro ----------------
    function gerarTabelaHTML(dados, titulo) {
        let acumuladoTotal = dados.reduce((sum, row) => sum + parseFloat(row.Acumulado), 0);
        let html = `<div class='card mb-4'>
                        <div class='card-header bg-primary text-white'>${titulo} » ${formatMoeda.format(acumuladoTotal)}</div>
                        <div class='card-body p-2'>
                            <div class='table-responsive small'>
                                <table class='table table-sm table-bordered table-striped table-hover mb-0'>
                                    <thead>
                                        <tr style='text-align:center'>
                                            <th>Ano</th>
                                            <th>Acumulado</th>`;
                                            meses.forEach(m => html += `<th>${m}</th>`);
            html += `   </tr>
                      </thead>`;

        //console.table(dados);

        dados.forEach(row => {
            html += `<tbody>
                        <tr>
                            <td style='text-align:center'>${row.Ano}</td>
                            <td style='text-align:right'>${formatMoeda.format(row.Acumulado)}</td>
                            `;
                meses.forEach(m => html += `<td style='text-align:right'>${formatMoeda.format(row[m])}</td>`);
            html += `</tr>
                     </tbody>`;
        });

        html += `</table>
                </div>
              </div>
            </div>`;
        return html;

    }

    async function carregarFinanceiro(codigoProcesso, tabelaPrevistoId, tabelaRealizadoId) {
        try {
            const res = await fetch(`../comum/dados/processoFinanceiro.php?codigoProcesso=${codigoProcesso}`);
            const data = await res.json();
            document.getElementById(tabelaPrevistoId).innerHTML = gerarTabelaHTML(data.previsto, 'Previsto');
            document.getElementById(tabelaRealizadoId).innerHTML = gerarTabelaHTML(data.realizado, 'Realizado');
        } catch(err) {
            console.error('Erro ao carregar financeiro:', err);
        }
    }

    
    // ---------------- Cartões ----------------
    async function carregarCartoes(codigoProcesso, containerCartoesId, containerGrauId) {
        try {
            const url = `../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=${codigoProcesso}`;
            const res = await fetch(url);
            const data = await res.json();

            const containerCartoes = document.getElementById(containerCartoesId);
            const containerGrau = document.getElementById(containerGrauId);
            containerCartoes.innerHTML = "";
            containerGrau.innerHTML = "";

            let previstoGlobal = [];
            let faturado = [];
            let previsto = [];

            data.forEach(resultado => {
                previstoGlobal.push(resultado.valor_previsto || 0);

                let realizado = (!resultado.valor_previsto || resultado.valor_faturado == 0)
                    ? 0
                    : resultado.valor_faturado / resultado.valor_previsto;

                let classeCartao, iconeCartao;
                if (!resultado.valor_previsto) {
                    classeCartao = 'bg-secondary text-white';
                    iconeCartao = 'fa fa-refresh fa-spin';
                } else if (realizado < 0.4) {
                    classeCartao = 'bg-danger text-white';
                    iconeCartao = 'fa fa-thumbs-down';
                } else if (realizado < 0.75) {
                    classeCartao = 'bg-warning text-black';
                    iconeCartao = 'fa fa-thumbs-down';
                } else if (realizado < 0.9) {
                    classeCartao = 'bg-primary text-white';
                    iconeCartao = 'fa fa-cog fa-spin';
                } else {
                    classeCartao = 'bg-success text-white';
                    iconeCartao = 'fa fa-smile';
                }

                if (resultado.valor_faturado != 0) {
                    const cartaoHTML = `
                    <div class="col-sm-6 col-md-3 mb-3">
                        <div class="card h-100 text-white ${classeCartao}" onclick="obraAuto('${codigoProcesso}', '${resultado.auto_num}')">
                            <div class="d-flex px-3 py-2">
                                <div class="flex-grow-1 text-left">
                                    <p class="mb-0 font-weight-bold small">${resultado.documento} do auto n.º ${resultado.auto_num}</p>
                                    <div>
                                        <h6 class="mb-1">${formatMoeda.format(resultado.valor_faturado)} - <span>${(realizado*100).toFixed(2)}%</span></h6>
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${formatMoeda.format(resultado.valor_previsto)}</h6>
                                    </div>
                                </div>
                                <span class="pl-2 mt-auto">
                                    <i class="fas ${iconeCartao} fa-3x text-white"></i>
                                </span>
                            </div>
                        </div>
                    </div>`;
                    containerCartoes.innerHTML += cartaoHTML;
                }

                if (resultado.valor_faturado != 0) {
                    faturado.push(resultado.valor_faturado);
                    previsto.push(resultado.valor_previsto);
                }
            });

            let totalFaturado = faturado.reduce((a,b)=>a+b,0);
            let totalPrevisto = previsto.reduce((a,b)=>a+b,0);
            let totalObra = previstoGlobal.reduce((a,b)=>a+b,0);
            let grauRealizado = totalPrevisto ? (totalFaturado/totalPrevisto)*100 : 0;
            let grauGlobal = totalObra ? (totalFaturado/totalObra)*100 : 0;

            containerGrau.innerHTML = `
                <div class="col col-md-4">
                    <div class="bg-primary text-white rounded text-center p-2">
                        <p>Grau de Execução até ao auto n.º ${faturado.length}</p>
                        <h3>${grauRealizado.toFixed(2)}%</h3>
                        <h6>Faturado: ${formatMoeda.format(totalFaturado)} de ${formatMoeda.format(totalPrevisto)}</h6>
                    </div>
                </div>
                <div class="col col-md-4">
                    <div class="bg-secondary text-white rounded text-center p-2">
                        <p>Grau de Execução Global</p>
                        <h3>${grauGlobal.toFixed(2)}%</h3>
                        <h6>Faturado: ${formatMoeda.format(totalFaturado)} de ${formatMoeda.format(totalObra)}</h6>
                    </div>
                </div>`;
        } catch(err) {
            console.error("Erro ao carregar cartões:", err);
        }
    }

    // ---------------- Gráfico ----------------
    async function criarGrafico(codigoProcesso, canvasId) {
        try {
            const url = `../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=${codigoProcesso}`;
            const res = await fetch(url);
            const data = await res.json();

            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            let labels = [], previstoAcum = [], realizadoAcum = [], previstoMensal = [], realizadoMensal = [];
            let acumPrevisto = 0, acumRealizado = 0;

            data.forEach(item => {
                labels.push(item.auto_num);
                acumPrevisto += Number(item.valor_previsto);
                acumRealizado += Number(item.valor_faturado);
                previstoAcum.push(acumPrevisto);
                realizadoAcum.push(acumRealizado);
                previstoMensal.push(Number(item.valor_previsto));
                realizadoMensal.push(Math.min(Number(item.valor_faturado), Number(item.valor_previsto)));
            });

            new Chart(canvas, {
                data: {
                    labels,
                    datasets: [
                        { label: 'Previsto Acumulado', type:'line', data: previstoAcum, borderColor:'rgba(255,99,132,1)', backgroundColor:'rgba(255,99,132,0.15)', fill:true, tension:0.3, yAxisID:'y' },
                        { label: 'Realizado Acumulado', type:'line', data: realizadoAcum, borderColor:'rgba(0,181,204,1)', backgroundColor:'rgba(0,181,204,0.15)', fill:true, tension:0.3, yAxisID:'y' },
                        { label: 'Previsto Mensal', type:'bar', data: previstoMensal, backgroundColor:'rgba(200,200,200,0.5)', yAxisID:'y1' },
                        { label: 'Realizado Mensal', type:'bar', data: realizadoMensal, backgroundColor:'rgba(0,123,255,0.8)', yAxisID:'y1' }
                    ]
                },
                options: {
                    responsive:true,
                    maintainAspectRatio:false,
                    interaction:{mode:'index',intersect:false},
                    scales:{
                        y:{beginAtZero:true, position:'left', title:{display:true,text:'Acumulado'}},
                        y1:{beginAtZero:true, position:'right', grid:{drawOnChartArea:false}, title:{display:true,text:'Mensal'}},
                        x:{stacked:true}
                    },
                    plugins:{legend:{position:'top'}, tooltip:{enabled:true}}
                }
            });

        } catch(err) {
            console.error("Erro ao criar gráfico:", err);
        }
    }

    return {
        Financeiro: { carregar: carregarFinanceiro },
        Cartoes: { carregar: carregarCartoes },
        Grafico: { criar: criarGrafico }
    };

})();
