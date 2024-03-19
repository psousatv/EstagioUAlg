var allData = [];
var tipo= [];
var rubrica= [];
var item= [];
var y1= [];
var y2= [];
var y3= [];

$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    })
    .done(
        function(data)
        {
            var dataTable = $('#tabela').DataTable({
                //data:{action:'fetch'},
                aaData: data, 
                aoColumns:[
                    { mDataProp: 'tipo'},
                    { mDataProp: 'rubrica'},
                    { mDataProp: 'item'},
                    { mDataProp: 'orcamento', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '%')},
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                ]

            })

            dataTable.rows().every(
                function(){
                    var rowData = this.data();
                    // Todos os dados de Datatable (data) para array local
                    allData.push(rowData);

                    tipo.push(rowData["tipo"]);
                    rubrica.push(rowData["rubrica"]);
                    item.push(rowData["item"]);

                    y1.push(rowData["orcamento"]);
                    y2.push(rowData["adjudicado"]);
                    y3.push(rowData["faturado"]);
                }
            );

            // Função para somar valores de uma propriedade ('campo') do objecto ('dados')
            var sumByProperty = (data, property) => {
                return data.reduce((sums, obj) => {
                const key = obj[property];
                // Assumindo que se quer somar o 'valor_maximo'
                sums[key] = (sums[key] || 0) + obj.adjudicado;
                return sums;
                }, {});
            };

            var sumByPropertyAndFilter = (data, sumProperty, filterProperty, filterValue) => {
                return data
                .filter(obj => obj[filterProperty] === filterValue)
                .reduce((sums, obj) => {
                    var key = obj[sumProperty];
                    sums[key] = (sums[key] || 0) + obj.adjudicado; // Assuming we want to sum the 'age' property
                    return sums;
                }, {});
            };


            // Soma agrupando
            var SomaPorTipo = sumByProperty(data, 'tipo');
            var SomaPorRubrica = sumByProperty(data, 'rubrica');
            var SomaPorItem = sumByProperty(data, 'item');
            // Soma os Valores agrupando por Rubrica e filtrado por Tipo de de Despesa = Investimentos
            //var SomaPorRubrica = sumByPropertyAndFilter(data, 'rubrica', 'tipo', 'item');

            console.log("SomaPorTipo", SomaPorTipo);
            console.log("SomaPorRubrica", SomaPorRubrica);
            console.log("SomaPorItem", SomaPorItem);
            console.log("allData", allData);
            console.log("Data", data);
            console.log("Tipo", tipo);


            // ** Gráficos
            var grafico;
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
            grafico = new Chart(group_chart,
            {
            type: 'bar',
            data: chart_data
            });



            // ** Cartões
            var container = document.getElementById('cartoesEsquerdaGrafico');
            container.innerHTML = "";
            data.forEach((result, idx) => {
            // Create card element
            var classeCartao = ''
            var iconeCartao = ''
            if (result["percent"] < 10) {
            var classeCartao = 'bg-danger';
            var iconeCartao = 'fa-thumbs-down'
            } else if (result["percent"] > 10 & result["percent"]< 35){
            var classeCartao = 'bg-warning';
            var iconeCartao = 'fa-warning'
            } else if (result["percent"] >35 & result["percent"] < 75){
            var classeCartao = 'bg-primary';
            var iconeCartao = 'fa-cogs'
            } else {
            var classeCartao = 'bg-success';
            var iconeCartao = 'fa-smile'
            };

            const card = document.createElement('div');
            card.classList = 'card-body';

            var cartoes = `
            <div class="col-xl-12 col-md-6 stretch-card grid-margin grid-margin-sm-0 pb-sm-3" >
            <div class="card ${classeCartao}">
            <div class="card-body">
            <div class="d-flex justify-content-between px-md-1">
            <div class="text-end">
                <p class="mb-0 text-white">${result["item"]}</p>
                <!--Faturado-->
                <h3 class="text-white">${Number(result["adjudicado"]).toLocaleString('pt')}€<span class="h6">- ${result["percent"]}%</span></h3>
                <!--Adjudicado-->
                <h6 class="text-white">${Number(result["orcamento"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
            </div>
            <div class="align-self-center">
                <i class="fas ${iconeCartao} text-white fa-3x"></i>
            </div>
            </div>
            </div>
            </div>
            </div>
            `;

            // Append newyly created card element to the container
            container.innerHTML += cartoes;
            });

        }
    );


