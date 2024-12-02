
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

        
    // Gráfico
    var grafico;
    var chart_data = {
        labels: obraAutos.map(row => row.auto_num),
        datasets:[
            {
            label : 'Previsto',
            backgroundColor : 'rgba(178, 34, 34, .3)',
            //color : '#fff',
            data: obraAutos.map(row => row.valor_previsto)
            },
            {
            label : 'Realizado',
            backgroundColor : 'rgba(3, 100, 255, .3)',
            //color : '#fff',
            data: obraAutos.map(row => row.valor_realizado)
            }
        ]
        };

        var group_chart = $('#grafPlanoPagamentos');

        if(grafico)
        {
            grafico.destroy();
        }
        grafico = new Chart(group_chart,
        {
        type: 'bar',
        data: chart_data
        });

        console.log("Dados: ", obraAutos);

    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });


