// Configuração e iniciação do Dashboard Orçamento
// Configura, atribui os dados e inicia os elementos da página - DataTable, Graph e Progress Bars
// Esta página não tem as iterações Online com o Server
// Para isso terá que se configurar as funções fetch_data. o PHP e DataTables (processing e server side)


//var coresGraficos = ['red', 'blue', 'green', 'purple', 'orange'];


$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            var dataTable = $('#tabela').DataTable({
                aaData: data, 
                aoColumns:[
                    { mDataProp: 'sector_actividade'},
                    { mDataProp: 'ano'},
                    { mDataProp: 'nome'},
                    { mDataProp: 'valor_maximo', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'lista_se'},
                    { mDataProp: 'estado'}
                    //{ mDataProp: 'rubrica'},
                    //{ mDataProp: 'regime'},
                    //{ mDataProp: 'contrato'},
                    //{ mDataProp: 'procedimento'}
                ]

            })           
            
            // Função para somar valores de uma propriedade ('campo') do objecto ('dados')
            var sumByProperty = (data, property) => {
                return data.reduce((sums, obj) => {
                const key = obj[property];
                // Assumindo que ser somar o 'valor_maximo'
                sums[key] = (sums[key] || 0) + obj.valor_maximo;
                return sums;
                }, {});
            };
            

            var sumByPropertyAndFilter = (data, sumProperty, filterProperty, filterValue) => {
                return data
                  .filter(obj => obj[filterProperty] === filterValue)
                  .reduce((sums, obj) => {
                    var key = obj[sumProperty];
                    sums[key] = (sums[key] || 0) + obj.valor_maximo; // Assuming we want to sum the 'age' property
                    return sums;
                  }, {});
            };


            // Soma agrupando por Sector de Actividade
            var SomaPorActividade = sumByProperty(data, 'sector_actividade');
            // Soma agrupando por Rubrica
            var SomaPorRubrica = sumByProperty(data, 'rubrica');
            // Soma os Valores agrupando por Rubrica e filtrado por Tipo de de Despesa = Gastos
            var SomaPorRubricaGastos = sumByPropertyAndFilter(data, 'rubrica', 'tipo_rubrica', 'Gastos');
            // Soma os Valores agrupando por Rubrica e filtrado por Tipo de de Despesa = Investimentos
            var SomaPorRubricaInvestimentos = sumByPropertyAndFilter(data, 'rubrica', 'tipo_rubrica', 'Investimento');
                        
          
            // Gráficos
            var  colorR = [];
            var dynamicColors = function() {
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                return "rgb(" + r + "," + g + "," + b + ")";
            };

            for(var i in data){
                colorR.push(dynamicColors());
                //*colorR.push(coresGraficos());
            };
            //Gráfico 1
            var ctx1 = document.getElementById('grafico1').getContext('2d');
           
            var myChart1 = new Chart(ctx1, {
                type: 'doughnut', // Alterar como se entender (e.g., 'polarArea', 'doughnut', 'pie')
                data: {
                    labels: Object.keys(SomaPorRubricaInvestimentos),
                    datasets: [
                        {
                        label: Object.keys(SomaPorRubricaInvestimentos),
                        data: Object.values(SomaPorRubricaInvestimentos),
                        backgroundColor: colorR,
                        borderColor: colorR,
                        borderWidth: 1
                        }
                    ]
                },
                
                options: {
                    legend: {
                        position: "bottom"
                    }
                }
            });

            //Gráfico 2
            var ctx2 = document.getElementById('grafico2').getContext('2d');
            var myChart2 = new Chart(ctx2, {
                type: 'doughnut', // Alterar como se entender (e.g., 'polarArea', 'doughnut', 'pie')
                data: {
                    labels: Object.keys(SomaPorRubricaGastos),
                    datasets: [{
                        label: Object.keys(SomaPorRubricaGastos),
                        data: Object.values(SomaPorRubricaGastos),
                        backgroundColor: colorR,
                        borderColor: colorR,
                        borderWidth: 1
                    }]
                },
                options: {
                    legend: {
                        position: "bottom"
                    }
                }
            });
            
        }
    );





