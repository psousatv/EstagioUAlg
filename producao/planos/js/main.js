// Orçamento

$(document).ready(
    function()
    {
        fetch_data();
        var grafico_investimentos;
        var grafico_gastos;

        function fetch_data()
        {
        var dataTable = $('#tabela').DataTable(
            {
            //"scrollY": 300,
            //"paging": false,
            "pageLength": 20,
            "processing": true,
            "serverSide": true,
            "myDataTable": [],
            "ajax":{
                url:"dados/main.php",
                type:"POST",
                data:{action:'fetch'}
            },
            "columnDefs":[
                { targets: [3, 5, 6], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','') },
                { targets: [4, 7], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','%') },
                { targets: [0, 1, 2], className: 'dt-body-left' }
            ],
            "drawCallback": function(settings){
                var dados = [];
                var barraProgresso = [];
                //var tipo = [];
                //var rubrica = [];
                var inv_item = [];
                var inv_y1 = [];
                var inv_y2 = [];
                var inv_y3 = [];
                gast_item =  [];
                var gast_y1 = [];
                var gast_y2 = [];
                var gast_y3 = [];

                for(var count = 0; count < settings.aoData.length; count++){
                    dados.push(settings.aoData[count]._aData);
                    //tipo.push(settings.aoData[count]._aData[0]);
                    //rubrica.push(settings.aoData[count]._aData[1]);
                    
                    barraProgresso.push([count + 1, 
                                        settings.aoData[count]._aData[2],
                                        settings.aoData[count]._aData[4]]);

                if(settings.aoData[count]._aData[0] === 'Investimento'){
                    inv_item.push([count + 1]);
                    inv_y1.push(parseFloat(settings.aoData[count]._aData[3]));
                    inv_y2.push(parseFloat(settings.aoData[count]._aData[5]));
                    inv_y3.push(parseFloat(settings.aoData[count]._aData[6]));

                } else {
                    gast_item.push([count + 1]);
                    gast_y1.push(parseFloat(settings.aoData[count]._aData[3]));
                    gast_y2.push(parseFloat(settings.aoData[count]._aData[5]));
                    gast_y3.push(parseFloat(settings.aoData[count]._aData[6]));

                };
                };

                // Investimentos
                var chart_data = {
                    labels: inv_item,
                    datasets:[
                        {
                        label : 'Orçamento',
                        backgroundColor : 'rgba(178, 34, 34, .3)',
                        //color : '#fff',
                        data: inv_y1
                        },
                        {
                        label : 'Adjudicado',
                        backgroundColor : 'rgba(3, 100, 255, .3)',
                        //color : '#fff',
                        data: inv_y2
                        },
                        {
                        label : 'Facturado',
                        backgroundColor : 'rgba(0, 181, 204, .5)',
                        //color : '#fff',
                        data: inv_y3
                        }
                    ]
                    };
                    var group_chart = $('#Investimentos');
                    if(grafico_investimentos)
                    {
                        grafico_investimentos.destroy();
                    }
                    grafico_investimentos = new Chart(group_chart,
                    {
                    type: 'bar',
                    data: chart_data
                    });

                // Gastos
                var chart_data1 = {
                    labels: gast_item,
                    datasets:[
                        {
                        label : 'Orçamento',
                        backgroundColor : 'rgba(178, 34, 34, .3)',
                        //color : '#fff',
                        data: gast_y1
                        },
                        {
                        label : 'Adjudicado',
                        backgroundColor : 'rgba(3, 100, 255, .3)',
                        //color : '#fff',
                        data: gast_y2
                        },
                        {
                        label : 'Facturado',
                        backgroundColor : 'rgba(0, 181, 204, .5)',
                        //color : '#fff',
                        data: gast_y3
                        }
                    ]
                    };
                    var group_chart1 = $('#Gastos');
                    if(grafico_gastos)
                    {
                        grafico_gastos.destroy();
                    }
                    grafico_gastos = new Chart(group_chart1,
                    {
                    type: 'bar',
                    data: chart_data1
                    });

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
                
            console.log("Data", dados);
            console.log("Dados Inv_item", inv_item);
            console.log("Dados Inv_item", gast_item);
            //console.log("Progresso", barraProgresso);
            

            }
            });
        }
    }
    );