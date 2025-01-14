

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
            
            var classeCartao = ''
            var iconeCartao = ''


            var realizado = 0

            if(result["faturado"] != 0 && result["previsto"] != 0 ){
                realizado = (result["faturado"] / result["previsto"]) * 100;
            } else if(result["previsto"] == 0) {
                realizado = result["faturado"] * 100;
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
                    <div onclick="orcamentoRedirected('${result["cod"]}')" class="card col-md-3 ${classeCartao}">
                        <div class="d-flex justify-content-between px-md-1">
                            <div class="text-end">
                                <p class="mb-0 small text-white">${result["item"]}</p>
                                <!--Faturado-->
                                <h6>${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${realizado.toFixed(2)}%</span></h3>
                                <!--Orçamento-->
                                <h6>${Number(result["previsto"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
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

            if(result["faturado"] != 0 && result["previsto"] != 0 ){
                realizado = (result["faturado"] / result["previsto"]) * 100;
            } else if(result["previsto"] == 0) {
                realizado = result["faturado"] * 100;
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
            
            if(result["tipo"] == 'Gastos'){
                var cartoesGastos = `     
                    <div onclick="orcamentoRedirected('${result["cod"]}')" class="card col-md-3 ${classeCartao}">
                        <div class="d-flex justify-content-between px-md-1">
                            <div class="text-end">
                                <p class="mb-0 small text-white">${result["item"]}</p>
                                <!--Faturado-->
                                <h3 class="text-white">${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${realizado.toFixed(2)}%</span></h3>
                                <!--Orçamento-->
                                <h6 class="text-white">${Number(result["previsto"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
                            </div>
                            <div class="align-self-center">
                                <i class="fas ${iconeCartao} text-white fa-3x"></i>
                            </div>
                        </div>
                    </div>
                `;
            // Append newyly created card element to the container
            containerInvestimentos.innerHTML += cartoesGastos;
            }});
        }
    )
};

    
//});


// Os resultados da Seleção é redirecionado para a orcamentoResults.html
// Quando se seleciona uma candidatura - obtem a identificação e passa para o "Título"
function orcamentoRedirected(orcamentoItem) {
    
    //var params = new URLSearchParams(window.location.search);
    //var anoCorrente = params.get("anoCorrente");

<<<<<<< HEAD
    var URL = "orcamentoResults.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + 2024; //anoAtual;
=======
    var URL = "orcamentoResults.html?orcamentoItem=" + orcamentoItem + "&anoCorrente=" + 2025; //anoAtual;
>>>>>>> b346ccfdf1c3638d87e71cb3279a7d647a048994
    window.location.href = URL;
    
    };

function anoDefault(){
    var data = new Date();
    var anoAtual = data.getFullYear();   
    var endereco = 'dados/main.php?anoCorrente='

    document.getElementById('anoCorrente').value = 2024;
    
    var anoFormulario = document.getElementById('anoCorrente').value;

    var url = endereco + anoFormulario;
        cartoes(url);

        console.log("anoInicio", anoAtual);
        console.log("anoInicio", anoAtual);
};



function mudaAno(){

    var anoFormulario = document.getElementById('anoCorrente').value;
    var endereco = 'dados/main.php?anoCorrente=' + anoFormulario;

    cartoes(endereco);
        
    console.log("anoFormularioMudaAno", anoFormulario);

};
