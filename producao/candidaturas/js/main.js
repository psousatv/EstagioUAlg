// Configuração e iniciação do Dashboard Candidaturas
// Configura, atribui os dados e inicia os elementos da página - DataTable, Graph e Progress Bars
// Esta página não tem as iterações Online com o Server
// Para isso terá que se configurar as funções fetch_data. o PHP e DataTables (processing e server side)

// Cores a atribuir aos Gráficos
//var cores = ['red', 'blue', 'green', 'purple', 'orange'];

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
                    { mDataProp: 'candidatura'},
                    { mDataProp: 'percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'recebido_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'faturado_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'elegivel', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'recebido', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') }
                ],
                order: {
                    mDataProp: 'inicio',
                    dir: 'DESC'},
            })

            var allData = [];
            var dadosProgresso = [];
            var dadosGrafico = [];
            var titulo_colunas = [];
            var nome_candidatura = [];

            
            dataTable.rows().every(
                function(){
                    var rowData = this.data();
                    // Todos os dados de Datatable (data) para array local
                    allData.push(rowData);
                    // Títulos para x do gráfico
                    titulo_colunas = Object.keys(rowData);
                    // Designação das Candidaturas
                    nome_candidatura.push(rowData["candidatura"]);
                    // Dados para a barra de progresso - etiquetas e valores - array
                    dadosProgresso.push([rowData["candidatura"], rowData["recebido"], rowData["recebido_percent"]]);
                    // Valores recebidos - para o Gráfico
                    dadosGrafico.push(rowData["recebido"]);
                }
                
            );
            
            // ** Cartões
            var container = document.getElementById('cartoesEsquerdaGrafico');
            container.innerHTML = "";
            data.forEach((result, idx) => {
            // Create card element
            
            var classeCartao = ''
            var iconeCartao = ''
            
            //Se taxa do valor recebido for menor que 15% que o valor previsto
            if (result["recebido_percent"] <= result["percent"]- 15) {
                var classeCartao = 'bg-danger text-white';
                var iconeCartao = 'fa fa-thumbs-down'
            } else if (result["recebido_percent"] <= result["percent"]- 10){
                var classeCartao = 'bg-warning text-black';
                var iconeCartao = 'fa fa-warning'
            } else if (result["recebido_percent"] <= result["percent"] - 5){
                var classeCartao = 'bg-primary text-white';
                var iconeCartao = 'fa fa-cog fa-spin'
            } else {
                var classeCartao = 'bg-success text-white';
                var iconeCartao = 'fa fa-smile'
            };

            const card = document.createElement('div');
            card.classList = 'card-body';
            
            var cartoes = `
            
                <div onclick="candidaturaRedirected('${result["candidatura"]}')" class="card col-md-3 ${classeCartao}">
                    <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 small text-white">${result["candidatura"]}</p>
                            <!--Reembolsos-->
                            <h6>${Number(result["recebido"]).toLocaleString('pt')}€<span class="h6">- ${result["recebido_percent"]}%</span></h3>
                            <!--Elegível-->
                            <h6>${Number(result["elegivel"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas ${iconeCartao} text-white fa-3x"></i>
                        </div>
                    </div>
                </div>
            `;
            // Append newyly created card element to the container
            container.innerHTML += cartoes;
            });
        }
    );

// Os resultados da Seleção é redirecionado para a candidaturasResults.html
// Quando se seleciona uma candidatura - obtem a identificação e passa para o "Título"
function candidaturaRedirected(nomeCandidatura) {
    console.log("Nome Candidatura", nomeCandidatura);
    //var params = nomeCandidatura;
    var URL = "candidaturaResults.html?nomeCandidatura=" + nomeCandidatura;
    window.location.href = URL;
    
    };