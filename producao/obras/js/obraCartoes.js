
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

    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });


