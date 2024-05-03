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
                    { mDataProp: 'aprovado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'validado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'recebido', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'recebido_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'execucao_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
                ]
            })

            // Conversões dos dados do DataTable para os Gráficos e Progress Bar
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
                    dadosGrafico.push(rowData["aprovado"]);
                }
            );

            // Siglas das Candidaturas para os últimas 5 letras da Designação
            var sigla_candidatura = []
            for (var i = 0; i < nome_candidatura.length; i++) {
                var originalString = nome_candidatura[i];
                var lasttFiveLetters = originalString.slice(-6);
                sigla_candidatura.push(lasttFiveLetters);
            }

            // Gráfico
            var ctx = document.getElementById('grafico').getContext('2d');

            var  colorR = [];
            var dynamicColors = function() {
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                return "rgb(" + r + "," + g + "," + b + ")";
            };

            for(var i in data){
                colorR.push(dynamicColors());
            }
            var myChart = new Chart(ctx, {
                type: 'doughnut', // Alterar como se entender (e.g., 'polarArea', 'doughnut', 'pie')
                data: {
                    labels: nome_candidatura,
                    datasets: [{
                        label: dadosGrafico,
                        data: dadosGrafico,
                        backgroundColor: colorR,
                        borderColor: colorR,
                        borderWidth: 1
                    }]
                },
                options: {
                    legend: {
                        position: "left"
                    }
                }
            });

            // Progress Bar
            // Contentores para agregar as barras de progresso
            const progressBarsContainer = document.getElementById('container-progresso');
            // Função para crear una barra de progresso
            function createProgressBar(value)
            {
                // Contentores
                // 1
                const progressWrapper = document.createElement('div');
                progressWrapper.className = 'mt-3';
                //2
                const progressWrapperFlex = document.createElement('div');
                progressWrapperFlex.className = 'd-flex no-block align-items-center';
                //3 - Os títulos das barras - acima das barras
                const progressSpan = document.createElement('span')
                //4 - Agregador das barras
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress';
                //5 - As barras
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar progress-bar-striped';
                //6 - As designações das barras - dentro das barras
                const progressSpanBar = document.createElement('span')

                // configuração dos contentores - ordem
                progressBarsContainer.appendChild(progressWrapper);
                progressWrapper.appendChild(progressSpan);
                progressWrapper.appendChild(progressContainer);
                progressContainer.appendChild(progressBar);
                progressBar.appendChild(progressSpanBar);

                // Configuração das barras
                var width = 0;
                const interval = setInterval(function()
                {
                    if (width >= value[2]) {
                        clearInterval(interval);
                    } else {
                        width++;
                        progressBar.style.width = width + '%';
                        progressSpan.textContent = value[0];
                        progressSpanBar.textContent = value[1].toLocaleString('pt-PT') +' - ' + value[2] + '%';
                    }
                }, 1);
            }

            // Atribuir os dados às barras de progresso
            dadosProgresso.forEach(function(value)
            {
                createProgressBar(value);
            });

            // Iniciar as barras de progresso quando se acede à Página
            window.addEventListener('load', function(){
                createProgressBar();
            });

            console.log("barraProgresso", dadosProgresso);
            console.log("Data: ", data);
            console.log("AllData: ", allData);
            
            
            // ** Cartões
            var container = document.getElementById('cartoesEsquerdaGrafico');
            container.innerHTML = "";
            data.forEach((result, idx) => {
            // Create card element
            var classeCartao = ''
            var iconeCartao = ''
            if (result["execucao_percent"] < 10) {
                var classeCartao = 'bg-danger';
                var iconeCartao = 'fa-thumbs-down'
            } else if (result["execucao_percent"] > 10 & result["execucao_percent"]< 35){
                var classeCartao = 'bg-warning';
                var iconeCartao = 'fa-warning'
            } else if (result["execucao_percent"] >35 & result["execucao_percent"] < 75){
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
                        <p class="mb-0 text-white">${result["candidatura"]}</p>
                        <!--Faturado-->
                        <h3 class="text-white">${Number(result["faturado"]).toLocaleString('pt')}€<span class="h6">- ${result["execucao_percent"]}%</span></h3>
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





