// Orçamento

$(document).ready(
    function()
    {
        fetch_data();
        var grafico1;

        function fetch_data()
        {
        var dataTable = $('#tabela').DataTable(
            {
            //"scrollY": 300,
            //"paging": false,
            "processing": true,
            "serverSide": true,
            "myDataTable": [],
            "ajax":{
                url:"dados/main.php",
                type:"POST",
                data:{action:'fetch'}
            },
            "columnDefs":[
                { targets: [3, 4, 6], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','') },
                { targets: [5], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','%') },
                { targets: [0, 1, 2], className: 'dt-body-left' }
            ],
            "drawCallback": function(settings){
                var dados = []
                var tipo = []
                var rubrica = [];
                var item = [];
                var tabela_valor_y = [];
                var tabela_valor_y1 = [];
                var tabela_valor_y2 = [];

                for(var count = 0; count < settings.aoData.length; count++){
                    dados.push(settings.aoData[count]._aData);
                    tipo.push(settings.aoData[count]._aData[0]);
                    rubrica.push(settings.aoData[count]._aData[1]);
                    item.push(settings.aoData[count]._aData[2]);
                    tabela_valor_y.push(parseFloat(settings.aoData[count]._aData[3]));
                    tabela_valor_y1.push(parseFloat(settings.aoData[count]._aData[4]));
                    tabela_valor_y2.push(parseFloat(settings.aoData[count]._aData[6]));
                };
    
                var sumByPropertyAndFilter = (dados, sumProperty, filterProperty, filterValue) => {
                    return dados
                      .filter(obj => obj[filterProperty] === filterValue)
                      .reduce((sums, obj) => {
                        var key = obj[sumProperty];
                        sums[key] = (sums[key] || 0) + obj.tabela_valor_y2; // Assuming we want to sum the 'age' property
                        return sums;
                      }, {});
                };

                            
                console.log("Data", dados);
                console.log("Tipo", tipo);
                console.log("Rubrica", rubrica);
                console.log("Item", item);
                console.log("Sum", sumByPropertyAndFilter);


                // ** Cartões
                var container = document.getElementById('cartoes');
                container.innerHTML = "";
                dados.forEach((result, idx) => {
                // Create card element
                var classeCartao = ''
                var iconeCartao = ''
                if (result[5] < 10) {
                    var classeCartao = 'bg-danger';
                    var iconeCartao = 'fa-thumbs-down'
                } else if (result[5] > 10 & result[5]< 35){
                    var classeCartao = 'bg-warning';
                    var iconeCartao = 'fa-warning'
                } else if (result[5] >35 & result[5] < 75){
                    var classeCartao = 'bg-primary';
                    var iconeCartao = 'fa-cogs'
                } else {
                    var classeCartao = 'bg-success';
                    var iconeCartao = 'fa-smile'
                };

                const card = document.createElement('div');
                card.classList = 'card-body';
                
                var cartoes = `
                
                    <div class="card ${classeCartao}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 text-white">${result[2]}</p>
                            <!--Faturado-->
                            <h3 class="text-white">${Number(result[4]).toLocaleString('pt')}€<span class="h6">- ${result[5]}%</span></h3>
                            <!--Adjudicado-->
                            <h6 class="text-white">${Number(result[3]).toLocaleString('pt')}€<span class="h6"> </span></h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas ${iconeCartao} text-white fa-3x"></i>
                        </div>
                        </div>
                    </div>
                    </div>
                
                `;
                
                // Append newyly created card element to the container
                container.innerHTML += cartoes;
                });


                // ** Gráficos
                var chart_data1 = {
                labels: rubrica,
                datasets:[
                    {
                    label : 'Orçamento',
                    backgroundColor : 'rgba(3, 138, 255, .3)',
                    //color : '#fff',
                    data: tabela_valor_y
                    },
                    {
                    label : 'Adjudicado',
                    backgroundColor : 'rgba(3, 100, 255, .3)',
                    //color : '#fff',
                    data: tabela_valor_y1
                    },
                    {
                    label : 'Facturado',
                    backgroundColor : 'rgba(0, 181, 204, .5)',
                    //color : '#fff',
                    data: tabela_valor_y2
                    }
                ]
                };
                var group_chart1 = $('#grafico');
                if(grafico1)
                {
                grafico1.destroy();
                }
                grafico1 = new Chart(group_chart1,
                {
                type: 'bar',
                data: chart_data1
                })
            }
            });
        }
    }
    );