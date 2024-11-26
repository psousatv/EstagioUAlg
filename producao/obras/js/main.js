//Processos

$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            //var grafico;
            var dataTable = $('#tabela').DataTable({
                aaData: data,
                aoColumns:[
                    { mDataProp: 'contrato'},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
                ]
            })

            // ** Cartões
            var container = document.getElementById('cartoes');
            container.innerHTML = "";
            data.forEach((result, idx) => {
            // Create card element
            var classeCartao = ''
            var iconeCartao = ''
            if (result["percent"] < 10) {
                var classeCartao = 'bg-danger text-white';
                var iconeCartao = 'fa fa-thumbs-down'
            } else if (result["percent"] > 10 & result["percent"]< 35){
                var classeCartao = 'bg-warning text-black';
                var iconeCartao = 'fa fa-warning'
            } else if (result["percent"] >35 & result["percent"] < 75){
                var classeCartao = 'bg-primary text-white';
                var iconeCartao = 'fa fa-cog fa-spin'
            } else {
                var classeCartao = 'bg-success text-white';
                var iconeCartao = 'fa fa-smile'
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
                        <h6>${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${result["percent"]}%</span></h3>
                        <!--Adjudicado-->
                        <h6">${Number(result["adjudicado"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
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
