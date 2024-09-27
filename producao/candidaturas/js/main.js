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
                    { mDataProp: 'elegivel', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'recebido', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'recebido_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'faturado_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
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

            

            // Siglas das Candidaturas para os últimas 5 letras da Designação
            var sigla_candidatura = []
            for (var i = 0; i < nome_candidatura.length; i++) {
                var originalString = nome_candidatura[i];
                var lasttFiveLetters = originalString.slice(-6);
                sigla_candidatura.push(lasttFiveLetters);
            }

           
            // ** Cartões
            var container = document.getElementById('cartoesEsquerdaGrafico');
            container.innerHTML = "";
            data.forEach((result, idx) => {
            // Create card element
            
            var classeCartao = ''
            var iconeCartao = ''
            if (result["faturado_percent"] < 10) {
                var classeCartao = 'bg-danger';
                var iconeCartao = 'fa-thumbs-down'
            } else if (result["faturado_percent"] > 10 & result["faturado_percent"]< 35){
                var classeCartao = 'bg-warning';
                var iconeCartao = 'fa-warning'
            } else if (result["faturado_percent"] >35 & result["faturado_percent"] < 75){
                var classeCartao = 'bg-primary';
                var iconeCartao = 'fa-cogs'
            } else {
                var classeCartao = 'bg-success';
                var iconeCartao = 'fa-smile'
            };

            const card = document.createElement('div');
            card.classList = 'card-body';
            
            var cartoes = `
            
                <div onclick="candidaturaRedirected('${result["candidatura"]}')" class="card col-md-3 ${classeCartao}">
                    <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 small text-white">${result["candidatura"]}</p>
                            <!--Faturado-->
                            <h3 class="text-white">${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${result["faturado_percent"]}%</span></h3>
                            <!--Adjudicado-->
                            <h6 class="text-white">${Number(result["adjudicado"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
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