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
                { targets: [2, 3], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','') },
                { targets: [4], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','%') },
                { targets: [0, 1], className: 'dt-body-left' }
            ],
            "drawCallback": function(settings){
                var dados = []
                var rubrica = [];
                var tabela_valor_y1 = [];
                var tabela_valor_y2 = [];

                for(var count = 0; count < settings.aoData.length; count++){
                    dados.push(settings.aoData[count]._aData)
                    rubrica.push(settings.aoData[count]._aData[0]);
                    tabela_valor_y1.push(parseFloat(settings.aoData[count]._aData[2]));
                    tabela_valor_y2.push(parseFloat(settings.aoData[count]._aData[3]));
                }
    
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
                console.log ("dados: ", dados[3][3]);
                console.log("Rubrica", rubrica);
                console.log("Sum", sumByPropertyAndFilter);


                // ** Cartões
                <div class="col-xl-12 col-md-6 stretch-card pb-sm-3 pb-lg-0">
                    <div class="card bg-danger">
                    <div class="card-body">
                        <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 text-white">Protocolos</p>
                            <h3 class="text-white">1.346.617<span class="h5">,60</span></h3>
                            <h6 class="text-white">88.675<span class="h6">,36 - 6,59%</span></h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-map-signs text-black fa-3x"></i>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>

                const container = document.getElementById('cartao6');
                apiResult.forEach((result, idx) => {
                // Create card element
                const card = document.createElement('div');
                card.classList = 'card-body';
                
                // Construct card content
                const content = `
                    <div class="card">
                    <div class="card-header" id="heading-${idx}">
                    <h5 class="mb-0">
                    </h5>
                    </div>
                
                    <div id="collapse-${idx}" class="collapse show" aria-labelledby="heading-${idx}" data-parent="#accordion">
                    <div class="card-body">
                
                        <h5>${result.title}</h5>
                        <p>${result.description}</p>
                        <p>${result.output}</p>
                        ...
                    </div>
                    </div>
                </div>
                `;
                var cartoes = `
                <div class="col-xl-12 col-md-6 stretch-card pb-sm-3 pb-lg-0">
                    <div class="card bg-danger">
                    <div class="card-body">
                        <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 text-white">Protocolos</p>
                            <h3 class="text-white">1.346.617<span class="h5">,60</span></h3>
                            <h6 class="text-white">88.675<span class="h6">,36 - 6,59%</span></h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-map-signs text-black fa-3x"></i>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                `;
                
                // Append newyly created card element to the container
                container.innerHTML += content;
                });


                // ** Gráficos
                var chart_data1 = {
                labels: rubrica,
                datasets:[
                    {
                    label : 'Previsto',
                    backgroundColor : 'rgba(3, 138, 255, .3)',
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