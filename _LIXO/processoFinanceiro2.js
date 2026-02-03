(() => {
    const params = new URLSearchParams(window.location.search);
    const codigoProcesso = params.get("codigoProcesso");

    if (!codigoProcesso) {
        console.error("Código do processo não informado na URL.");
        return;
    }

    // -------------------------------
    // 1️⃣ Financeiro: tabelas
    // -------------------------------
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const formatMoeda = Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

    function gerarTabelaHTML(dados, titulo) {
        let acumuladoTotal = dados.reduce((sum, row) => sum + parseFloat(row.Acumulado), 0);

        let html = `<b>${titulo} » ${formatMoeda.format(acumuladoTotal)}</b>
                    <table class='table table-bordered table-striped table-hover small'>
                    <tr style='text-align: center'>
                        <th>Ano</th>
                        <th>Acumulado</th>`;

        meses.forEach(m => html += `<th>${m}</th>`);
        html += `</tr>`;

        dados.forEach(row => {
            html += `<tr>
                        <td style='text-align:center'>${row.Ano}</td>
                        <td style='text-align:right'>${formatMoeda.format(row.Acumulado)}</td>`;
            meses.forEach(m => html += `<td style='text-align:right'>${formatMoeda.format(row[m])}</td>`);
            html += `</tr>`;
        });

        html += `</table>`;
        return html;
    }

    function carregarFinanceiro() {
        fetch(`dados/processoFinanceiro.php?codigoProcesso=${codigoProcesso}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('tabelaPrevisto').innerHTML = gerarTabelaHTML(data.previsto, 'Previsto');
                document.getElementById('tabelaRealizado').innerHTML = gerarTabelaHTML(data.realizado, 'Realizado');
            })
            .catch(err => console.error('Erro ao carregar financeiro:', err));
    }

    // -------------------------------
    // 2️⃣ Cartões + Gráfico (uma chamada)
    // -------------------------------
    function carregarCartoesEGrafico() {
        const url = `../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=${codigoProcesso}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // ------- Cartões -------
                const containerCartoes = document.getElementById('lstObraCartoes');
                const containerGrau = document.getElementById('cartaoGrauExecucao');
                containerCartoes.innerHTML = "";
                containerGrau.innerHTML = "";

                let previstoGlobal = [];
                let faturado = [];
                let previsto = [];

                // Dados para gráfico
                let labels = [], previstoAcum = [], realizadoAcum = [], previstoMensal = [], realizadoMensal = [];
                let acumPrevisto = 0, acumRealizado = 0;

                data.forEach(resultado => {
                    previstoGlobal.push(resultado.valor_previsto || 0);

                    // Percentual realizado por auto
                    let realizado = (!resultado.valor_previsto || resultado.valor_faturado == 0)
                        ? 0
                        : resultado.valor_faturado / resultado.valor_previsto;

                    // Cartões
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
                        <div class="col-sm-6 col-md-4 mb-2">
                            <div class="card h-100 text-white ${classeCartao}" onclick="obraAuto('${codigoProcesso}', '${resultado.auto_num}')">
                                <div class="d-flex px-3 py-2">
                                    <div class="flex-grow-1 text-left">
                                        <p class="mb-0 font-weight-bold small">${resultado.documento} do auto n.º ${resultado.auto_num}</p>
                                        <div>
                                            <h6 class="mb-1">${formatMoeda.format(resultado.valor_faturado)} - 
                                            <span>${(realizado*100).toFixed(2)}%</span></h6>
                                        </div>
                                        <div>
                                            <h6 class="mb-0">${formatMoeda.format(resultado.valor_previsto)}</h6>
                                        </div>
                                    </div>
                                    <div class="pl-2 mt-auto">
                                        <i class="fas ${iconeCartao} fa-3x text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                        containerCartoes.innerHTML += cartaoHTML;
                    }

                    if (resultado.valor_faturado != 0) {
                        faturado.push(resultado.valor_faturado);
                        previsto.push(resultado.valor_previsto);
                    }

                    // ------- Dados gráfico -------
                    labels.push(resultado.auto_num);
                    acumPrevisto += Number(resultado.valor_previsto);
                    acumRealizado += Number(resultado.valor_faturado);
                    previstoAcum.push(acumPrevisto);
                    realizadoAcum.push(acumRealizado);
                    previstoMensal.push(Number(resultado.valor_previsto));
                    realizadoMensal.push(Math.min(Number(resultado.valor_faturado), Number(resultado.valor_previsto)));
                });

                // ------- Grau de execução -------
                let totalFaturado = faturado.reduce((a,b)=>a+b,0);
                let totalPrevisto = previsto.reduce((a,b)=>a+b,0);
                let totalObra = previstoGlobal.reduce((a,b)=>a+b,0);
                let grauRealizado = totalPrevisto ? (totalFaturado / totalPrevisto)*100 : 0;
                let grauGlobal = totalObra ? (totalFaturado / totalObra)*100 : 0;

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

                // ------- Monta gráfico -------
                const canvas = document.getElementById('lstObraGrafico');
                if (canvas) {
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
                }
            })
            .catch(err => console.error("Erro ao carregar cartões e gráfico:", err));
    }

    // -------------------------------
    // 3️⃣ Inicializa tudo
    // -------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        carregarFinanceiro();
        carregarCartoesEGrafico();
    });
})();
