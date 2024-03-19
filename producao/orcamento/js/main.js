// Orçamento

$(document).ready(
    function()
    {
        fetch_data();
        var grafico;

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
                { targets: [1, 2, 4], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','') },
                { targets: [3], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','%') },
                { targets: [0], className: 'dt-body-left' }
            ],
            "drawCallback": function(settings){
                var dados = []
                var tipo = []
                var rubrica = [];
                var item = [];
                var y = [];
                var y1 = [];
                var y2 = [];
                var y3 = [];

                for(var count = 0; count < settings.aoData.length; count++){
                    dados.push(settings.aoData[count]._aData);
                    //tipo.push(settings.aoData[count]._aData[0]);
                    //rubrica.push(settings.aoData[count]._aData[1]);
                    item.push(settings.aoData[count]._aData[0]);
                    y.push(parseFloat(settings.aoData[count]._aData[1],
                                      settings.aoData[count]._aData[2],
                                      settings.aoData[count]._aData[4]));
                    y1.push(parseFloat(settings.aoData[count]._aData[1]));
                    y2.push(parseFloat(settings.aoData[count]._aData[2]));
                    y3.push(parseFloat(settings.aoData[count]._aData[4]));
                };

                console.log("Data", dados);
                //console.log("Tipo", tipo);
                console.log("Grafico", y);
                //console.log("Rubrica", rubrica);
                console.log("Item", item);
                //console.log("Sum", somaPorRubrica);


                // ** Cartões
                var container = document.getElementById('cartoesAcimaGrafico');
                container.innerHTML = "";
                dados.forEach((result, idx) => {
                // Create card element
                var classeCartao = ''
                var iconeCartao = ''
                if (result[3] < 10) {
                    var classeCartao = 'bg-danger';
                    var iconeCartao = 'fa-thumbs-down'
                } else if (result[3] > 10 & result[3]< 35){
                    var classeCartao = 'bg-warning';
                    var iconeCartao = 'fa-warning'
                } else if (result[3] >35 & result[3] < 75){
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
                            <p class="mb-0 text-white">${result[0]}</p>
                            <!--Faturado-->
                            <h3 class="text-white">${Number(result[2]).toLocaleString('pt')}€<span class="h6">- ${result[3]}%</span></h3>
                            <!--Adjudicado-->
                            <h6 class="text-white">${Number(result[1]).toLocaleString('pt')}€<span class="h6"> </span></h6>
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
                var chart_data = {
                labels: item,
                datasets:[
                    {
                    label : 'Orçamento',
                    backgroundColor : 'rgba(178, 34, 34, .3)',
                    //color : '#fff',
                    data: y1
                    },
                    {
                    label : 'Adjudicado',
                    backgroundColor : 'rgba(3, 100, 255, .3)',
                    //color : '#fff',
                    data: y2
                    },
                    {
                    label : 'Facturado',
                    backgroundColor : 'rgba(0, 181, 204, .5)',
                    //color : '#fff',
                    data: y3
                    }
                ]
                };
                var group_chart = $('#grafico');
                if(grafico)
                {
                grafico.destroy();
                }
                grafico1 = new Chart(group_chart,
                {
                type: 'bar',
                data: chart_data
                })
            }
            });
        }
    }
    );