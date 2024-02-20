//Preenche a Tabela de DataTable - myDataTable (# significa que se trata do id na tag)

// Cores a atribuir aos Gráficos
var cores = ['red', 'blue', 'green', 'purple', 'orange'];


$.ajax({
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    })
    .done(function(data){
        var dataTable = $('#tabela1')
        .DataTable({
            aaData: data,
            aoColumns:[
                { mDataProp: 'proces_estado_nome'},
                { mDataProp: 'proces_nome'},
                { mDataProp: 'proces_data_adjudicacao'},
                { mDataProp: 'proces_val_adjudicacoes', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') }
                //{ mDataProp: 'contrato'},
                //{ mDataProp: 'ano'},
                //{ mDataProp: 'previsto', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                //{ mDataProp: 'realizado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                //{ mDataProp: 'taxa_realizacao', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                //{ mDataProp: '1', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                //{ mDataProp: '2', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '3', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '4', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                //{ mDataProp: '5', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '6', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '7', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '8', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '9', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '10', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '11', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                //{ mDataProp: '12', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
            ]
        })

        // Conversões dos dados do DataTable para os Gráficos e Progress Bar
        var allData = [];
        var dadosProgresso = [];
        var dadosGrafico = [];
        var xLabels = []
        var titles = []
       
        dataTable.rows().every(function(){
            var rawData = this.data();
            // Todos os dados de Datatable (data) para array local
            allData.push(rawData);
            // Títulos para x do gráfico
            xLabels = Object.keys(rawData);
            // Designação das Candidaturas
            titles.push(rawData["contrato"]);
            // Dados para a barra de progresso - etiquetas e valores - array
            dadosProgresso.push([rawData["contrato"], rawData["taxa_realizacao"]]);
            // Valores recebidos - para o Gráfico
            dadosGrafico.push(rawData["realizado"]);

        });
        
        console.log("Faturação: ", allData)

        // Progress Bar
        // Contentores para agregar as barras de progresso
        // Investimentos em Curso
        var progressBarsContainer = document.getElementById('progresso1');
        // Função para crear una barra de progresso
        function createProgressBar(value){
            // Contentores
            // 1
            var progressWrapper = document.createElement('div');
            progressWrapper.className = 'mt-3';
            //2
            var progressWrapperFlex = document.createElement('div');
            progressWrapperFlex.className = 'd-flex no-block align-items-center';
            //3 - Os títulos das barras - acima das barras
            var progressSpan = document.createElement('span')
            //4 - Agregador das barras
            var progressContainer = document.createElement('div');
            progressContainer.className = 'progress';
            //5 - As barras
            var progressBar = document.createElement('div');
            progressBar.className = 'progress-bar progress-bar-striped';
            //6 - As designações das barras - dentro das barras
            var progressSpanBar = document.createElement('span')

            // configuração dos contentores - ordem
            progressBarsContainer.appendChild(progressWrapper);
            progressWrapper.appendChild(progressSpan);
            progressWrapper.appendChild(progressContainer);
            progressContainer.appendChild(progressBar);
            progressBar.appendChild(progressSpanBar);

            // Configuração das barras
            var width = 0;
            var interval = setInterval(function(){
                if (width >= value[1]) {
                    clearInterval(interval);
                } else {
                    width++;
                    progressBar.style.width = width + '%';
                    progressSpan.textContent = value[0];
                    progressSpanBar.textContent = value[1] + '%';
                }
            }, 10);
        }
        // Atribuir os dados às barras de progresso
        dadosProgresso.forEach(function(value){
            createProgressBar(value);
        });
        
        // Iniciar as barras de progresso quando se acede à Página
        window.addEventListener('load', function(){
            createProgressBar();
        });
        
        // Obras em Curso
        var progressBarsContainer2 = document.getElementById('progresso2');
        // Função para crear una barra de progresso
        function createProgressBar2(value2){
            // Contentores
            // 1
            var progressWrapper2 = document.createElement('div');
            progressWrapper2.className = 'mt-3';
            //2
            var progressWrapperFlex2 = document.createElement('div');
            progressWrapperFlex2.className = 'd-flex no-block align-items-center';
            //3 - Os títulos das barras - acima das barras
            var progressSpan2 = document.createElement('span')
            //4 - Agregador das barras
            var progressContainer2 = document.createElement('div');
            progressContainer2.className = 'progress';
            //5 - As barras
            var progressBar2 = document.createElement('div');
            progressBar2.className = 'progress-bar progress-bar-striped';
            //6 - As designações das barras - dentro das barras
            var progressSpanBar2 = document.createElement('span')

            // configuração dos contentores - ordem
            progressBarsContainer2.appendChild(progressWrapper2);
            progressWrapper2.appendChild(progressSpan2);
            progressWrapper2.appendChild(progressContainer2);
            progressContainer2.appendChild(progressBar2);
            progressBar2.appendChild(progressSpanBar2);

            // Configuração das barras
            var width = 0;
            var interval2 = setInterval(function()
            {
                if (width >= value2[1]) {
                    clearInterval(interval2);
                } else {
                    width++;
                    progressBar2.style.width = width + '%';
                    progressSpan2.textContent = value2[0];
                    progressSpanBar2.textContent = value2[1];
                }
            }, 10);

        }
        // Atribuir os dados às barras de progresso
        dadosProgresso.forEach(function(value2){
            createProgressBar2(value2);
        });
        // Iniciar as barras de progresso quando se acede à Página
        window.addEventListener('load', function(){
            createProgressBar2();
        });
    
    }
);
