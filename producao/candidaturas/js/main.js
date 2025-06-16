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
                    { mDataProp: 'taxa', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'elegivel', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },{ mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'recebido', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado_recebido_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'elegivel_recebido_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
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
                    dadosProgresso.push([rowData["candidatura"], rowData["recebido"], rowData["elegivel_recebido_percent"]]);
                    // Valores recebidos - para o Gráfico
                    dadosGrafico.push(rowData["recebido"]);
                }
                
            );
            
            // ** Cartões
            var containerCurso = document.getElementById('cartoesCandidaturaEmCurso');
            var containerEncerrada = document.getElementById('cartoesCandidaturaEncerrada');
            containerCurso.innerHTML = "";
            containerEncerrada.innerHTML = "";

            data.forEach((result) => {
            // Create card element
            
            var classeCartao = ''
            var iconeCartao = ''
            
            //Se taxa Cores dos Cartões conforme o montante recebido (Elegível)
            // Até 65%
            if (result["elegivel_recebido_percent"] <= result["taxa"] - 35.01) {
                var classeCartao = 'bg-danger text-white';
                var iconeCartao = 'fa fa-thumbs-down'
            // Até 75% - 
            } else if (result["elegivel_recebido_percent"] <= result["taxa"]- 25.01){
                var classeCartao = 'bg-warning text-black';
                var iconeCartao = 'fa fa-warning'
            // Até 85% - Melhorar
            } else if (result["elegivel_recebido_percent"] <= result["taxa"] - 15.01){
                var classeCartao = 'bg-primary text-white';
                var iconeCartao = 'fa fa-cog fa-spin'
            // Mais de 95% - Sucesso
            } else {
                var classeCartao = 'bg-success text-white';
                var iconeCartao = 'fa fa-smile'
            };

            var cartao = document.createElement('div');
            cartao.classList = 'card-body';
            
            var cartoes = `
            
                <div onclick="candidaturaRedirected('${result["candidatura"]}')" class="card col-md-3 ${classeCartao}">
                    <div class="d-flex justify-content-between px-md-1">
                        <div class="text-end">
                            <p class="mb-0 small text-white">${result["candidatura"]}</p>
                            <!--Faturado vs Reembolsos vs % -->
                            <span class="h6">${Number(result["faturado"]).toLocaleString('pt')}€(F)</span>
                            <span class="h6">- ${Number(result["recebido"]).toLocaleString('pt')}€(R)</span>
                            <span class="h6">- ${result["faturado_recebido_percent"]}%</span>
                            
                            <!--Elegível-->
                            <h6>
                                ${Number(result["elegivel"]).toLocaleString('pt')}€(E)
                            <span class="h6"> - ${result["elegivel_recebido_percent"]}%</span>
                            </h6>
                        </div>
                        <div class="align-self-center">
                            <i class="fas ${iconeCartao} text-white fa-3x"></i>
                        </div>
                    </div>
                </div>
            `;
            // Acrescenta o cartão ao container
            if(result["estado"] == 'Em Curso'){
                containerCurso.innerHTML += cartoes;
            } else {
                containerEncerrada.innerHTML += cartoes;
            };

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