//Processos

$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            var grafico;
            var dataTable = $('#tabela').DataTable({
                aaData: data,
                aoColumns:[
                    { mDataProp: 'contrato'},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
                ]
            })

            // Conversões dos dados do DataTable para os Gráficos e Progress Bar
            var allData = [];
            var dadosGrafico = [];
            var titulo_colunas = [];

            dataTable.rows().every(
                function(){
                    var rowData = this.data();
                    // Todos os dados de Datatable (data) para array local
                    allData.push(rowData);
                    // Títulos para x do gráfico
                    titulo_colunas = Object.keys(rowData);
                    // Valores recebidos - para o Gráfico
                    dadosGrafico.push([rowData["contrato"], rowData["adjudicado"], rowData["faturado"]]);
                }
            );

            
            // Gráfico
            var chart_data = {
                labels: data.map(row => row.contrato),
                datasets:[
                    {
                    label : 'Adjudicado',
                    backgroundColor : 'rgba(178, 34, 34, .3)',
                    //color : '#fff',
                    data: data.map(row => row.adjudicado)
                    },
                    {
                    label : 'Faturado',
                    backgroundColor : 'rgba(3, 100, 255, .3)',
                    //color : '#fff',
                    data: data.map(row => row.faturado)
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
            <div class="col-md-12 col-md-6 stretch-card pb-sm-3 pb-lg-0" >
                <div class="card ${classeCartao}">
                <div class="card-body">
                    <div class="d-flex justify-content-between px-md-1">
                    <div class="text-end">
                        <p class="mb-0 text-white">${result["contrato"]}</p>
                        <!--Faturado-->
                        <h3 class="text-white">${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${result["percent"]}%</span></h3>
                        <!--Adjudicado-->
                        <h6 class="text-white">${Number(result["adjudicado"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
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
