
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 

// Array para absorver os dados Totais dos autos
// Existing JavaScript array
var obraAutos = [];

// Fetch JSON data from the PHP script
fetch('../obras/dados/obraAutos.php?codigoProcesso=' + codigoProcesso)
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
        // Append the fetched data to the existing array
        obraAutos = obraAutos.concat(data);

    // Gauge
        var totalRealizado = 0;
        var totalPrevisto = 0;
        
        for(var i=0; i<obraAutos.length; i++){
            totalRealizado += obraAutos[i]['fact_valor_realizado'];
            totalPrevisto += obraAutos[i]['auto_valor_previsto'];
        }
        
        var valorObra = obraAutos[0]['processo_valor_adjudicado'];
        var percentRealizado = (totalRealizado / valorObra) * 100;
        var percentPrevisto = (totalPrevisto / valorObra) * 100;
        var percentAutos = (totalRealizado /totalPrevisto) * 100;

        var containerGauge = document.getElementById('lstObraGauge');
        containerGauge.innerHTML = "";

        console.log("Dados: ", obraAutos);
        console.log("Valor Obra: ", valorObra);
        console.log("Realizado: ", totalRealizado);
        console.log("Previsto: ", totalPrevisto);
        //console.log("PercentR: ", percentRealizado);
        //console.log("PercentP: ", percentPrevisto);
        //console.log("PercentAutos: ", percentAutos);
        
        const { AgCharts } = agCharts;

        const options = {
        type: "radial-gauge",
        container: containerGauge, //document.getElementById("lstObraGauge"),
        placement: "middle",
        value: percentRealizado,
        scale: {
            min: 0,
            max: 1000,
        },
        targets: [
            {
            value: percentPrevisto,
            text: "Previsto: " + totalPrevisto.toLocaleString('pt'),
            placement: "outside",
            shape: "triangle",
            fill: "yellow",
            strokeWidth: 2,
            spacing: 35,
            },
            {
            value: percentRealizado,
            text: "Faturado", // + totalRealizado.toLocaleString('pt'),
            placement: "inside",
            shape: "triangle",
            fill: "green",
            strokeWidth: 2,
            spacing: 5,
            },
        ],
        };

        AgCharts.createGauge(options);
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });

