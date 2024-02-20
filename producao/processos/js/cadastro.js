
// Cores a atribuir aos Gráficos
var cores = ['red', 'blue', 'green', 'purple', 'orange'];


$(document).ready(function(){

    fetch_data();

    var grafico;

    function fetch_data(start_date='', end_date=''){
        var dataTable = $('#tabela').DataTable({
            "processing":true,
            "serverSide":true,
            "tabela":[],
            "ajax":{
                "url":"dados/cadastro.php",
                "type":"POST",
                "data":{action:'fetch'}
            },
            "columnDefs":[
                {targets:[36, 39, 29, 33, 38]},
                [targets[48, 50]]
            ],
            "drawCallback":function(settings){
                // 
                var valor_x = [];
                // adjudicado
                var valor_y = [];
                // faturado
                var valor_y1 = [];

                for (var count = 0; count < settings.aoData.length; count ++){
                    valor_x.push(settings.aoData[count].aData[0]);
                    valor_y.push(parseFloat(settings.aoData[count].aData[6]));
                    valor_y1.push(parseFloat(settings.aoData[count].aData[7]));
                }

                var chart_data = {
                    labels: valor_x,
                    datasets:[
                        {
                            label: '',
                            backgroubdColor: 'rgba(105,0,132,.2)',
                            data: valor_y
                        },
                        {
                            label: '',
                            backgroubdColor: 'rgba(105,0,132,.2)',
                            data: valor_y
                        }
                    ]
                };

                var group_chart = $('#grafico');
                
                if (grafico){
                    grafico.destroy();
                }

                grafico = new chart_data(group_chart, {
                    type:'line',
                    data: chart_data
                });
            }
        });
    }

});