
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 

// Array para absorver os dados Totais dos autos
// Existing JavaScript array
var obraAutos = [];

// Fetch JSON data from the PHP script
fetch('../obras/dados/obraAutos.php?codigoProcesso=' + codigoProcesso)
    .then(response => response.json())  // Parse the JSON response
    .then(returnedData => {
        // Append the fetched data to the existing array
        //obraAutos = obraAutos.concat(data);
        var arr = Object.values(returnedData.data);
        obraAutos.push(arr);
    });

    var totalRealizado = 0;
    var totalPrevisto = 0;
    
    var containerGauge = document.getElementById('lstObraGrafico');

    for(var i=0; i<obraAutos.length; i++){

        totalRealizado += obraAutos[i]['fact_valor_realizado'];
        totalPrevisto += obraAutos[i]['auto_valor_previsto'];

        containerGauge.innerHTML = totalRealizado;
        
        var valorObra = obraAutos[0]['processo_valor_adjudicado'];
        var percentRealizado = (totalRealizado / valorObra) * 100;
        var percentPrevisto = (totalPrevisto / valorObra) * 100;
        var percentAutos = (totalRealizado /totalPrevisto) * 100;

        $('lstObraGrafico').text(obraAutos);
        
    };

    console.log("Dados: ", obraAutos);
    console.log("Valor Obra: ", valorObra);
    console.log("Realizado: ", totalRealizado);
    console.log("Previsto: ", totalPrevisto);
    console.log("PercentR: ", percentRealizado);
    console.log("PercentP: ", percentPrevisto);
    console.log("PercentAutos: ", percentAutos);