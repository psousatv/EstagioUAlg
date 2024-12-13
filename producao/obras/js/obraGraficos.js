
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = '../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=' + codigoProcesso;

var resultado = [];
var labelsGrafico = [];
var xPrevisto = [];
var xRealizado = [];

//Funcção
fetchData();

// Fetch JSON data from the PHP script
function fetchData(){
fetch(url)
.then(response => {
    if(!response.ok){
        throw new Error (document.getElementById('lstErros').innerHTML = response.statusText);    
    }
    return response.json();
})
.then(data => {
    resultado.push(...data);

    for(var i = 0; i < resultado.length; i++){
        
        labelsGrafico.push(resultado[i].mes_previsto);
        xPrevisto.push(resultado[i]['valor_previsto']);
        xRealizado.push(resultado[i]['valor_faturado']);

        //Gráfico
        var ctx = document.getElementById('lstObraGrafico').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',  // You can change this to 'line', 'pie', etc.
            data: {
                labels: labelsGrafico, //[30, 35, 40, 50, 45], //data[i].mes_previsto, //['January', 'February', 'March', 'April', 'May'],  // x-axis labels
                datasets: [{
                    label: 'Previsto',  // Label for the dataset
                    data: xPrevisto, //[30, 35, 40, 50, 45], //data[i]['valor_previsto'], //[12, 19, 3, 5, 2],  // Data points for each label
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],  // Color for each bar
                    borderColor: [
                        'rgba(255, 99, 132, 1)'
                    ],  // Border color for each bar
                    borderWidth: 1  // Border width for the bars
                },
                {
                    label: 'Realizado',  // Label for the dataset
                    data: xRealizado, //[30, 35, 40, 50, 45], //data[i]['valor_previsto'], //[12, 19, 3, 5, 2],  // Data points for each label
                    backgroundColor: [
                        'rgba(0, 181, 204, 0.5)'
                    ],  // Color for each bar
                    borderColor: [
                        'rgba(255, 99, 132, 1)'
                    ],  // Border color for each bar
                    borderWidth: 1  // Border width for the bars
                }]
            },
            options: {
                responsive: true,  // Makes the chart responsive
                scales: {
                    y: {
                        beginAtZero: true  // Ensures the y-axis starts at 0
                    }
                }
            }
        });

    };
})
    .catch(error => {
        document.getElementById('lstErros').innerHTML = error;
    });
};

 // Demonstrate that the variable is updated
 //setTimeout(() => {
 //   console.log('Dados fora da Função:', resultado);
//}, 2000); // Delay to ensure the fetch completes