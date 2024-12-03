
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = '../obras/dados/obraPlanoPagamentosAutos.php?codigoProcesso=' + codigoProcesso;

var resultado = [];
var obraGrafico;

//Funcção
fetchData();

// Fetch JSON data from the PHP script
function fetchData(){
fetch(url)
.then(response => {
    if(!response.ok){
        throw new Error (document.getElementById('lstObraGrafico').innerHTML = response.statusText);    
    }
    return response.json();
})
.then(data => {
    resultado.push(...data);
    //Dados dentro da Função
    //resultado.forEach(function(dados){
    //    document.getElementById('lstObraGrafico').innerHTML += dados;
    //});

    for(var i = 0; i < data.length; i++){
        console.log('Dataset gráfico;  x, y (previsto):', data[i].mes_previsto, data[i]['valor_previsto'], data[i]['valor_realizado']);
        
        //Gráfico
        var ctx = document.getElementById('lstObraGrafico').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',  // You can change this to 'line', 'pie', etc.
            data: {
                labels: data[i].mes_previsto, //['January', 'February', 'March', 'April', 'May'],  // x-axis labels
                datasets: [{
                    label: 'Previsto',  // Label for the dataset
                    data: data[i]['valor_previsto'], //[12, 19, 3, 5, 2],  // Data points for each label
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],  // Color for each bar
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
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

        //Gráfico 2
        // Gastos
        var chart_data = {
            labels: data[i].mes_previsto,
            datasets:[
                {
                label : 'Previsto',
                backgroundColor : 'rgba(178, 34, 34, .3)',
                //color : '#fff',
                data: data[i]['valor_previsto']
                },
                {
                label : 'Realizado',
                backgroundColor : 'rgba(0, 181, 204, .5)',
                //color : '#fff',
                data: data[i]['valor_realizado']
                }
            ]
            };
            var group_chart1 = $('#lstObraGrafico');
            if(obraGrafico)
            {
                obraGrafico.destroy();
            }
            obraGrafico = new Chart(group_chart,
            {
            type: 'bar',
            data: chart_data
            });
        

        };
    })
    .catch(error => {
        document.getElementById('lstObraGrafico').innerHTML = error;
    });
};

 // Demonstrate that the variable is updated
 //setTimeout(() => {
    console.log('Dados fora da Função:', resultado);
//}, 2000); // Delay to ensure the fetch completes