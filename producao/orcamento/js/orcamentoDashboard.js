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

            // ** Investimentos
            var containerInvestimentos = document.getElementById('cartoesInvestimentos');
            containerInvestimentos.innerHTML = "";
            data.forEach((result) => {
            
            var classeCartao = '';
            var iconeCartao = '';
            var realizado = 0;

            //console.table(result);

            if(result["adjudicado"] != 0 && result["previsto"] != 0 ){
                realizado = (result["adjudicado"] / result["previsto"]) * 100;
            } else if(result["previsto"] == 0) {
                realizado = result["adjudicado"] * 100;
            } else {
                realizado = 0;
            };


            if (realizado < 35) {
                classeCartao = 'bg-success';
                iconeCartao = 'fa-smile';
            } else if (realizado >= 35 & realizado < 75){
                classeCartao = 'bg-warning';
                iconeCartao = 'fa-warning';
            } else {
                classeCartao = 'bg-danger';
                iconeCartao = 'fa-thumbs-down';
            };

            const card = document.createElement('div');
            card.classList = 'card-body';
            
            if(result["tipo"] == 'Investimento'){
                var cartoesIvestimentos = `     
                    <div onclick="orcamentoNested('${result["cod"]}')" class="card col-md-3 ${classeCartao} text-white">
                        <div class="d-flex justify-content-between px-md-1">
                            <div class="text-end">
                                <p class="mb-0 small text-white">${result["item"]}</p>
                                <!--Faturado-->
                                <h3>${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(result["adjudicado"])}<span class="h6">- ${realizado.toFixed(2)}%</span></h3>
                                <!--Orçamento-->
                                <h6>${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(result["previsto"])}<span class="h6"> </span></h6>
                            </div>
                            <div class="align-self-center">
                                <i class="fas ${iconeCartao} text-white fa-3x"></i>
                            </div>
                        </div>
                    </div>
                `;
            // Append newyly created card element to the container
            containerInvestimentos.innerHTML += cartoesIvestimentos;
            }});

            // ** Gastos
            var containerInvestimentos = document.getElementById('cartoesGastos');
            containerInvestimentos.innerHTML = "";
            data.forEach((result) => {
            
            var classeCartao = '';
            var iconeCartao = '';
            var realizado = 0;

            if(result["adjudicado"] != 0 && result["previsto"] != 0 ){
                realizado = (result["adjudicado"] / result["previsto"]) * 100;
            } else if(result["previsto"] == 0) {
                realizado = result["adjudicado"] * 100;
            } else {
                realizado = 0;
            };

            if (realizado < 35) {
                classeCartao = 'bg-success';
                iconeCartao = 'fa-smile';
            } else if (realizado >= 35 & realizado < 75){
                classeCartao = 'bg-warning';
                iconeCartao = 'fa-warning';
            } else {
                classeCartao = 'bg-danger';
                iconeCartao = 'fa-thumbs-down';
            };

            var card = document.createElement('div');
            card.classList = 'card-body';
            
// <div onclick="orcamentoRedirected('${result["cod"]}')" class="card col-md-3 ${classeCartao}">


            if(result["tipo"] == 'Gastos'){
                var cartoesGastos = `     
                    <div onclick="orcamentoNested('${result["cod"]}')" class="card col-md-3 ${classeCartao} text-white">
                        <div class="d-flex justify-content-between px-md-1">
                            <div class="text-end">
                                <p class="mb-0 small">${result["item"]}</p>
                                <!--Faturado-->
                                <h3>${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(result["adjudicado"])}<span class="h6">- ${realizado.toFixed(2)}%</span></h3>
                                <!--Orçamento-->
                                <h6>${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(result["previsto"])}<span class="h6"> </span></h6>
                            </div>
                            <div class="align-self-center">
                                <i class="fas ${iconeCartao} text-white fa-3x"></i>
                            </div>
                        </div>
                    </div>
                `;
            // Append newyly created card element to the containergit add
            containerInvestimentos.innerHTML += cartoesGastos;
            }});
        }
    )
};

    
//});


// Os resultados da Seleção é redirecionado para a orcamentoResults.html
// Quando se seleciona uma candidatura - obtem a identificação e passa para o "Título"
function orcamentoResults(orcamentoItem) {
    
    var URL = "orcamentoResults.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + anoCorrente; //anoAtual;
    //var URL = "datatablesNested.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + 2025; //anoAtual;
    getQueryParams();
    window.location.href = URL;
    
    };

    function orcamentoNested(orcamentoItem) {
    
    //var URL = "orcamentoResults.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + 2025; //anoAtual;
    var URL = "orcamentoNested.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + anoCorrente; //anoAtual;
    getQueryParams();
    window.location.href = URL;
    
    };

function anoDefault(){
    var data = new Date();
    var anoAtual = data.getFullYear();   
    var endereco = 'dados/orcamentoDashboard.php?anoCorrente='

    //document.getElementById('anoCorrente').value = 2024;
    
    var anoFormulario = document.getElementById('anoCorrente').value;

    var url = endereco + anoFormulario;

    anoCorrente = [];
    anoCorrente += anoFormulario;

    cartoes(url);

};



function mudaAno(){

    var anoFormulario = document.getElementById('anoCorrente').value;
    var endereco = 'dados/orcamentoDashboard.php?anoCorrente=' + anoFormulario;
    anoCorrente = [];
    anoCorrente += anoFormulario;

    cartoes(endereco);

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
  