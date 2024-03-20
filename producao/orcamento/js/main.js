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
                var dados = [];
                var barraProgresso = [];
                var tipo = [];
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
                    item.push([count + 1]);
                    barraProgresso.push([count + 1, 
                                        settings.aoData[count]._aData[0],
                                        settings.aoData[count]._aData[3]]);

                    y.push(parseFloat(settings.aoData[count]._aData[1],
                                      settings.aoData[count]._aData[2],
                                      settings.aoData[count]._aData[4]));
                    y1.push(parseFloat(settings.aoData[count]._aData[1]));
                    y2.push(parseFloat(settings.aoData[count]._aData[2]));
                    y3.push(parseFloat(settings.aoData[count]._aData[4]));
                };

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

                // Progress Bar
                // Contentores para agregar as barras de progresso
                const progressBarsContainer = document.getElementById('barraProgresso');
                progressBarsContainer.innerHTML = "";
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
                            progressSpan.textContent = value[0] + ' - ' + value[1];
                            progressSpanBar.textContent = value[2] + '%';
                        }
                    }, 1);
                }

                // Atribuir os dados às barras de progresso
                barraProgresso.forEach(function(value)
                {
                    createProgressBar(value);
                });

                // Iniciar as barras de progresso quando se acede à Página
                //window.addEventListener('load', function(){
                //    createProgressBar();
                //});
                
            //console.log("Data", dados);
            console.log("barraProgresso", barraProgresso);
            console.log("Item", item);
            //console.log("Sum", somaPorRubrica);

            }
            });
        }
    }
    );