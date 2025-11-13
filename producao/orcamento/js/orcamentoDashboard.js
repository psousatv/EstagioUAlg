var anoCorrente = [];

function cartoes(endereco){

$.ajax(
    {
    url: endereco,
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            //var dataTable = $('#tabela').DataTable({
            //    aaData: data,
            //    aoColumns:[
            //        { mDataProp: 'ano'},
            //        { mDataProp: 'tipo'},
            //        { mDataProp: 'rubrica'},
            //        { mDataProp: 'item'},
            //        { mDataProp: 'previsto', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
            //        { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') }
            //    ]
            //})


        // Cria os cartões
        //var containerInvestimentos = $('#cartoesInvestimentos');
        //var containerGastos = $('#cartoesGastos');
        var containerInvestimentos = document.getElementById('cartoesInvestimentos');
        var containerGastos = document.getElementById('cartoesGastos');
        //containerInvestimentos.empty();
        //containerGastos.empty();
        containerInvestimentos.innerHTML = "";
        containerGastos.innerHTML = "";

        data.forEach(dados => {
            let classeCartao, iconeCartao;

            console.table(dados);
            
            let adjudicado_percent = dados.adjudicado === 0 && dados.faturado === 0 ? 0 :
                        dados.adjudicado > 0 && dados.faturado === 0 ? 0 :
                        (dados.faturado / dados.adjudicado);
            let previsto_percent = dados.previsto === 0 && dados.faturado === 0 ? 0 :
                        dados.previsto > 0 && dados.faturado === 0 ? 0 :
                        (dados.faturado / dados.previsto);

            if (previsto_percent > .85) {
                classeCartao = 'bg-danger text-white';
                iconeCartao = 'fa fa-thumbs-down';
            } else if (previsto_percent > .70) {
                classeCartao = 'bg-warning text-dark';
                iconeCartao = 'fa fa-exclamation-triangle';
            } else if (previsto_percent > .50) {
                classeCartao = 'bg-primary text-white';
                iconeCartao = 'fa fa-cog fa-spin';
            } else {
                classeCartao = 'bg-success text-white';
                iconeCartao = 'fa fa-smile';
            }

            let cartao = `
            <div class="col-sm-6 col-md-3 mb-2">
                <div class="card h-100 ${classeCartao}" onclick="orcamentoNested('${dados.cod}')">
                    <div class="d-flex px-3 py-2 small">
                        <div class="flex-grow-1 text-left">
                            <p class="mb-1 font-weight-bold">${dados.item}</p>
                            <div>
                                <h6>
                                    ${Intl.NumberFormat("de-DE", 
                                        { style: "currency", currency: "EUR" }).format(dados.adjudicado)} -
                                    ${Intl.NumberFormat("de-DE", 
                                        { style: "currency", currency: "EUR" }).format(dados.faturado)} -
                                    <span>${Intl.NumberFormat("de-DE", 
                                        {style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(adjudicado_percent)}
                                    </span>
                                </h6>
                            </div>
                            <div>
                                <h5>
                                    ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(dados.previsto)} 
                                    <span class="h6">- ${Intl.NumberFormat("de-DE", 
                                        { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(previsto_percent)}
                                    </span>
                                </h5>
                            </div>
                        </div>
                        <div class="pl-2 mt-auto">
                            <i class="fas ${iconeCartao} fa-3x"></i>
                        </div>
                    </div>
                </div>
            </div>
            `;

            if (dados.tipo === 'Investimento') {
                containerInvestimentos.innerHTML += cartao;
                //containerInvestimentos.append(cartao);
            } else {
                containerGastos.innerHTML += cartao;
                //containerGastos.append(cartao);
            }

        });
    })
};


// Os resultados da Seleção é redirecionado para a orcamentoResults.html
function orcamentoResults(orcamentoItem) {
    var URL = "orcamentoResults.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + anoCorrente;
    getQueryParams();
    window.location.href = URL;
};

function orcamentoNested(orcamentoItem) {
    var URL = "orcamentoNested.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + anoCorrente;
    getQueryParams();
    window.location.href = URL;
};

function anoDefault(){
    var data = new Date();
    var anoAtual = data.getFullYear();
    document.getElementById('anoCorrente').value = anoAtual;

    var endereco = 'dados/orcamentoDashboard.php?anoCorrente=';
    var anoFormulario = document.getElementById('anoCorrente').value;
    

    var url = endereco + anoFormulario;

    anoCorrente = [];
    anoCorrente += anoFormulario;

    cartoes(url);

};

function mudaAno(){
    var anoFormulario = document.getElementById('anoCorrente').value;
    var endereco = 'dados/orcamentoDashboard.php?anoCorrente=';

    var url = endereco + anoFormulario;

    anoCorrente = [];
    anoCorrente += anoFormulario;
    
    cartoes(url);
};


function getQueryParams() {
    const params = {};
    const search = window.location.search;
    const query = new URLSearchParams(search);
    for (const [key, value] of query.entries()) {
      params[key] = value;
    }
    return params;
}
  