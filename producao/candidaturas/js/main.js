// Configuração e iniciação do Dashboard Candidaturas
// Configura, atribui os dados e inicia os elementos da página - DataTable, Graph e Progress Bars
// Esta página não tem as iterações Online com o Server
// Para isso terá que se configurar as funções fetch_data. o PHP e DataTables (processing e server side)

// Cores a atribuir aos Gráficos
//var cores = ['red', 'blue', 'green', 'purple', 'orange'];

var allData = [];
var dadosProgresso = [];
var dadosGrafico = [];
var titulo_colunas = [];
var nome_candidatura = [];
var classeCartao = '';
var iconeCartao = '';

$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            var dataTable = $('#tabela').DataTable({
                searching: false, // desativa a paginação
                lengthChange: false, // remove o texto "Enntradas x de y"
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

            data.forEach((dados) => {
            // Create card element            
            //Se taxa Cores dos Cartões conforme o montante recebido (Elegível)
            // Sucesso se mais de 85%
            if (dados["faturado_recebido_percent"] < 50.00) {
                var classeCartao = 'bg-danger text-white';
                var iconeCartao = 'fa fa-thumbs-down';
                console.log("Candidatura : ", dados["candidatura"]);
                console.log("Taxa: ", dados["faturado_recebido_percent"]);
            // Boa Execução se mais de 70% e menos de 85% - 
            } else if (dados["faturado_recebido_percent"] >= 50.00 && dados["faturado_recebido_percent"] <= 70.00){
                var classeCartao = 'bg-warning text-black';
                var iconeCartao = 'fa fa-thumbs-down';
                console.log("Candidatura : ", dados["candidatura"]);
                console.log("Taxa Danger : ", dados["faturado_recebido_percent"]);
            // Execução a melhorar se mais de 50% e menos de 70%
            } else if (dados["faturado_recebido_percent"] >= 70.01 && dados["faturado_recebido_percent"] <= 85.00){
                var classeCartao = 'bg-primary text-white';
                var iconeCartao = 'fa fa-cog fa-spin';
                console.log("Candidatura : ", dados["candidatura"] );
                console.log("Taxa Danger : ", dados["faturado_recebido_percent"]);
            // Execução muito fraca ou nula se menor que 50%
            } else {
                var classeCartao = 'bg-success text-white';
                var iconeCartao = 'fa fa-smile';
                console.log("Candidatura : ", dados["candidatura"]);
                console.log("Taxa Danger : ",  dados["faturado_recebido_percent"]);
            };

            //var cartao = document.createElement('div');
            //cartao.classList = 'card-body';
            
            var cartoes = `
                <div class="card col-mb-4">
                    <div class="card h-100 ${classeCartao}" onclick="candidaturaRedirected('${dados["candidatura"]}')" >
                        <div class="d-flex justify-content-between px-md-4">
                            <div class="text-end">
                                <p class="mb-0 small">${dados["candidatura"]}</p>
                                <h6>
                                    <span>${Number(dados["faturado"]).toLocaleString('pt')}€(F)</span>
                                    <span>- ${Number(dados["recebido"]).toLocaleString('pt')}€(R)</span>
                                    <span>- ${dados["faturado_recebido_percent"]}%</span>
                                    <!--Elegível-->
                                    <p>${Number(dados["elegivel"]).toLocaleString('pt')}€(E)
                                    <span> - ${dados["elegivel_recebido_percent"]}%</span>
                                    </p>
                                </h6>
                            </div>
                            <div class="align-self-center">
                                <i class="fas ${iconeCartao} text-white fa-3x"></i>
                            </div>
                        </div>
                    </div>
                </div>`;

            // Acrescenta o cartão ao container
            if(dados["estado"] == 'Em Curso'){
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