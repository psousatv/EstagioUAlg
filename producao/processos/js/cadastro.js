// Cadastro

$(document).ready(
    function()
    {
        fetch_data();
        var grafico1;
        var grafico2;
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
                url:"dados/cadastro.php",
                type:"POST",
                data:{action:'fetch'}
            },
            "columnDefs":[
                { targets: [2, 3], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                { targets: [0, 1], className: 'dt-body-left' }
            ],
            "drawCallback": function(settings){
                var tabela_valor_x = [];
                var tabela_valor_y1 = [];
                var tabela_valor_y2 = [];
                var tabela_valor_y3 = [];
                for(var count = 0; count < settings.aoData.length; count++){
                tabela_valor_x.push(settings.aoData[count]._aData[0]);
                tabela_valor_y1.push(parseFloat(settings.aoData[count]._aData[2]));
                tabela_valor_y2.push(parseFloat(settings.aoData[count]._aData[3]));
                tabela_valor_y3.push(parseFloat(settings.aoData[count]._aData[4]));
                }
                var chart_data1 = {
                labels: tabela_valor_x,
                datasets:[
                    {
                    label : 'Previsto',
                    backgroundColor : 'rgba(105, 0, 132, .2)',
                    //color : '#fff',
                    data: tabela_valor_y1
                    },
                    {
                    label : 'Adjudicado',
                    backgroundColor : 'rgba(200, 99, 132, .7)',
                    //color : '#fff',
                    data: tabela_valor_y2
                    }
                ]
                };
                var group_chart1 = $('#grafico');
                if(grafico1)
                {
                grafico1.destroy();
                }
                grafico1 = new Chart(group_chart1,
                {
                type: 'bar',
                data: chart_data1
                });
                var chart_data2 = {
                labels: tabela_valor_x,
                datasets:[
                    {
                    label : 'Adjudicado',
                    backgroundColor : 'rgba(105, 0, 132, .2)',
                    //color : '#fff',
                    data: tabela_valor_y2
                    },
                    {
                    label : 'Executado',
                    backgroundColor : 'rgba(200, 99, 132, .7)',
                    //color : '#fff',
                    data: tabela_valor_y3
                    }
                ]
                }
            }
            });
        }
    }
    );