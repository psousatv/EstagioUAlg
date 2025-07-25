
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
        } else if (resultado["valor_faturado"] != 0 && resultado["valor_previsto"] != 0 ){
            realizado = (resultado["valor_faturado"] / resultado["valor_previsto"]);
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
             <div class="col-12 col-sm-6 col-md-3 mb-3">
                <div class="card h-100 text-white ${classeCartao}" onclick="obraAuto('${codigoProcesso}', '${resultado["auto_num"]}')">
                <div class="card-body d-flex justify-content-between px-md-1">
                    <div class="text-end">
                    <p class="mb-0 small">
                        ${resultado["documento"]} do auto n.º ${resultado["auto_num"]}
                    </p>
                    <h6>
                        ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(resultado["valor_faturado"])}
                        <span class="h6">
                            ${Intl.NumberFormat("de-DE", { style: "percent",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2}).format(realizado)}
                        </span>
                    </h6>
                    <h6>
                        ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(resultado["valor_previsto"])};
                    </h6>
                    </div>
                    <div class="align-self-center">
                    <i class="fas ${iconeCartao} fa-3x"></i>
                    </div>
                </div>
                </div>
            </div>
        `;

        // Append newyly created card element to the container
        if(resultado["valor_faturado"] != 0){
            containerCartoesAutos.innerHTML += obraAutosCartoes;
        }});

    
        for(var i=0; i<resultados.length; i++){
            if(resultados[i]['valor_faturado'] != 0){
                faturado.push(resultados[i]["valor_faturado"]);
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

    var autos = faturado.length; 
    
    var containerGrauExecucao = document.getElementById('cartaoGrauExecucao');
    containerGrauExecucao.innerHTML = "";

//${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(saldo)}

    var grauExecucaoCartao = `
    <div class="row g-3 w-100" style="max-width: 50%;">
        <!-- Cartão 1 -->
        <div class="col-12 col-md-6">
            <div class="bg-primary text-white p-4 rounded h-100">
                <p class="mb-1 small text-center">Grau de Execução até ao auto n.º ${autos}</p>
                <h3 class="text-center">${Number(grauExecucaoRealizado).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</h3>
                <h6 class="text-center">
                Faturado: ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalFaturado)} 
                de ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalPrevisto)}
                </h6>
            </div>
        </div>

        <!-- Cartão 2 -->
        <div class="col-12 col-md-6">
            <div class="bg-secondary text-white p-4 rounded h-100">
                <p class="mb-1 small text-center">Grau de Execução Global</p>
                <h3 class="text-center">${Number(grauExecucaoGlobal).toLocaleString('de-DE')}%</h3>
                <h6 class="text-center">
                Faturado: ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalFaturado)}
                de ${Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(totalPrevisto)}
                </h6>
            </div>
        </div>
    </div>`;

        // Append newyly created card element to the container
        containerGrauExecucao.innerHTML += grauExecucaoCartao;
                
    })
    .catch(error => {
        //document.getElementById('lstErros').innerHTML = error;
        console.error("Error fetching the data:", error);
    });


//var auto = 10

function obraAuto(codigoProcesso,auto){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {

        document.getElementById("lstAuto").innerHTML = this.responseText;
        
        //window.open("","lstOutros");
      }
    }
    
    url = "dados/obraMapaSituacaoAuto.php" + "?codigoProcesso=" + codigoProcesso + "&auto=" + auto;

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    
};