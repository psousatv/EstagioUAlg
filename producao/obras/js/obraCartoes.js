
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = '../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=' + codigoProcesso;

var resultados = [];
var realizado = 0;
var faturado = [];
var previsto = []; //regista a previsão até ao último auto
var previstoGlobal = []; //regista a previsão total


// Fetch JSON data from the PHP script
fetch(url)
    .then(response => response.json())  // Parse the JSON response
    .then(returnedData => {
        // Append the fetched data to the existing array
        resultados = resultados.concat(returnedData);

        // Cartões
        var containerCartoesAutos = document.getElementById('lstObraCartoes');
        containerCartoesAutos.innerHTML = "";

        resultados.forEach((resultado) => {
        
        previstoGlobal.push(resultado["valor_previsto"]);
        
        var classeCartao = '';
        var iconeCartao = '';
        
        //Calculo de percentagem por Auto
        if(resultado["valor_previsto"] == null){
            realizado == 0;
        } else if (resultado["valor_realizado"] != 0 && resultado["valor_previsto"] != 0 ){
            realizado = (resultado["valor_realizado"] / resultado["valor_previsto"]) * 100;
        }  else {
            realizado == 0;
        };

        
        //Formata o cartão de acordo com a percentagem de realização
        if (resultado["valor_previsto"] == null){
            classeCartao = 'bg-secondary text-white';
            iconeCartao = 'fa fa-refresh fa-spin';
        } else if (realizado < 40){
            classeCartao = 'bg-danger text-white';
            iconeCartao = 'fa fa-thumbs-down';
        } else if (realizado >= 40 && realizado < 75){
            classeCartao = 'bg-warning text-black';
            iconeCartao = 'fa fa-thumbs-down';
        } else if (realizado >= 75 && realizado < 90){
            classeCartao = 'bg-primary text-white';
            iconeCartao = 'fa fa-cog fa-spin';
        } else if (realizado >= 90){
            classeCartao = 'bg-success text-white';
            iconeCartao = 'fa fa-smile';
        };
       
        var obraAutosCartoes = `     
            <div onclick="obraAuto('${resultado["auto_num"]}')" 
            class="card col-md-3 ${classeCartao}">
                <div class="d-flex justify-content-between px-md-1">
                    <div class="text-end">
                        <p class="mb-0 small text-white">
                            ${resultado["justificativo"]}
                        </p>
                        <!--Faturado-->
                        <h6>${Number(resultado["valor_realizado"]).toLocaleString('pt')}€<span class="h6">- ${realizado.toFixed(2)}%</span></h6>
                        <!--Plano de Pagamenos-->
                        <h6>${Number(resultado["valor_previsto"]).toLocaleString('pt')}€</h6>
                    </div>
                    <div class="align-self-center">
                        <i class="fas ${iconeCartao} text-white fa-3x"></i>
                    </div>
                </div>
            </div>
        `;

        // Append newyly created card element to the container
        if(resultado["valor_realizado"] > 0){
            containerCartoesAutos.innerHTML += obraAutosCartoes;
        }});

    
        for(var i=0; i<resultados.length; i++){
            if(resultados[i]['valor_realizado'] > 0){
                faturado.push(resultados[i]["valor_realizado"]);
                previsto.push(resultados[i]["valor_previsto"]);
        }
        };

        var totalFaturado = faturado.reduce((partialSum, a) => partialSum + a, 0);
        var totalPrevisto = previsto.reduce((partialSum, a) => partialSum + a, 0);
        var totalObra = previstoGlobal.reduce((partialSum, a) => partialSum + a, 0);
        var grauExecucaoRealizado = 0;
        var grauExecucaoGlobal = 0;


        //Calculo de percentagem da obra
    if(totalPrevisto == null){
        grauExecucaoRealizado == 0;
        grauExecucaoGlobal == 0;
    } else if (totalFaturado != 0 && totalPrevisto != 0 ){
        grauExecucaoRealizado = ((totalFaturado / totalPrevisto) * 100).toFixed(2);
        grauExecucaoGlobal = ((totalFaturado / totalObra) * 100).toFixed(2);
    };

    
    var containerGrauExecucao = document.getElementById('cartaoGrauExecucao');
    containerGrauExecucao.innerHTML = "";

    var grauExecucaoCartao = `
        <div class="d-flex justify-content-center col-sm-4 bg-secondary text-white ">
            <div class="d-flex justify-content-between px-md-1">
                <div>
                    <p class="mb-0 small text-center">Grau de Execução Global</p>
                    <h3 class="text-center">${Number(grauExecucaoGlobal).toLocaleString('pt')}%</h3>
                    <h6>Faturado: ${Number(totalFaturado).toLocaleString('pt')}€ de ${Number(totalObra).toLocaleString('pt')}€</span></h6>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-center col-sm-4 bg-primary text-white ">
            <div class="d-flex justify-content-between px-md-1">
                <div class="text-center">
                    <p class="mb-0 small">Grau de Execução</p>
                    <h3>${Number(grauExecucaoRealizado).toLocaleString('pt')}%</h3>
                    <h6>Faturado: ${Number(totalFaturado).toLocaleString('pt')}€ de ${Number(totalPrevisto).toLocaleString('pt')}€</h6>
                </div>
            </div>
        </div>
        `;

        // Append newyly created card element to the container
        containerGrauExecucao.innerHTML += grauExecucaoCartao;
                
    })
    .catch(error => {
        document.getElementById('lstObraGrafico').innerHTML = error;
        //console.error("Error fetching the data:", error);
    });


