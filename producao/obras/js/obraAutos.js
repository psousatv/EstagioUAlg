
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 

// Array para absorver os dados Totais dos autos
// Existing JavaScript array
var obraAutos = [];

// Fetch JSON data from the PHP script
fetch('dados/obraAutos.php?codigoProcesso=' + codigoProcesso)
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
        // Append the fetched data to the existing array
        obraAutos = obraAutos.concat(data);

        // Cartões
        var containerCartoesAutos = document.getElementById('lstObraCartoes');
        containerCartoesAutos.innerHTML = "";
        obraAutos.forEach((resultado) => {

          var classeCartao = '';
          var iconeCartao = '';
          var realizado = 0;
          
          if(resultado["auto_previsto"] == null){
                realizado == 0;
            } else if (resultado["auto_realizado"] != 0 && resultado["auto_previsto"] != 0 ){
                realizado = (resultado["auto_realizado"] / resultado["auto_previsto"]) * 100;
            }  else {
                realizado == 0;
            };

            if (resultado["auto_previsto"] == null){
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

        var card = document.createElement('div');
        card.classList = 'card-body';
       
        var obraAutosCartoes = `     
            <div onclick="obraAuto('${resultado["auto_num"]}')" class="card col-md-2 ${classeCartao}">
                <div class="d-flex justify-content-between px-md-1">
                    <div class="text-end">
                        <p class="mb-0 small text-white">
                            ${resultado["auto_fatura"]} de 
                            ${resultado["auto_data"].toLocaleString('pt')} 
                            do auto ${resultado["auto_num"]}
                        </p>
                        <!--Faturado-->
                        <h6>${Number(resultado["auto_realizado"]).toLocaleString('pt')}€<span class="h6">- ${realizado.toFixed(2)}%</span></h3>
                        <!--Plano de Pagamenos-->
                        <h6>${Number(resultado["auto_previsto"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
                    </div>
                    <div class="align-self-center">
                        <i class="fas ${iconeCartao} text-white fa-3x"></i>
                    </div>
                </div>
            </div>
        `;
        // Append newyly created card element to the container
        containerCartoesAutos.innerHTML += obraAutosCartoes;
      }
    );

    // Gauge
    var totalRealizado = 0;
    var totalPrevisto = 0;
    
    for(var i=0; i<obraAutos.length; i++){
        totalRealizado += obraAutos[i]['auto_realizado'];
        totalPrevisto += obraAutos[i]['auto_previsto'];
    }
    
    var valoObra = obraAutos[0]['valor_adjudicado'];
    var percentRealizado = (totalRealizado / valoObra) * 100;
    var percentPrevisto = (totalPrevisto / valoObra) * 100;
    var percentAutos = (totalRealizado /totalPrevisto) * 100;

    var containerGauge = document.getElementById('lstObraGauge');
    containerGauge.innerHTML = "";

    
    
            console.log("Dados: ", obraAutos);
            console.log("Valor Obra: ", valoObra);
            console.log("Realizado: ", totalRealizado);
            console.log("Previsto: ", totalPrevisto);
            console.log("PercentR: ", percentRealizado);
            console.log("PercentP: ", percentPrevisto);
            console.log("PercentAutos: ", percentAutos);
    

    const { AgCharts } = agCharts;

    const options = {
    type: "radial-gauge",
    container: containerGauge, //document.getElementById("lstObraGauge"),
    value: percentRealizado,
    scale: {
        min: 0,
        max: 100,
    },
    targets: [
        {
        value: percentPrevisto,
        text: "Previsto: " + totalPrevisto.toLocaleString('pt'),
        placement: "outside",
        shape: "triangle",
        fill: "green",
        strokeWidth: 2,
        spacing: 8,
        },
        {
        value: percentRealizado,
        text: totalRealizado.toLocaleString('pt'),
        placement: "inside",
        shape: "triangle",
        fill: "black",
        strokeWidth: 2,
        spacing: 8,
        },
    ],
    };

    AgCharts.createGauge(options);

    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });


