// Testes

$(document).ready(
    function()
    { 
        fetch_data();
        function fetch_data()
        {
        var dataTable = $('#tabela').DataTable({
            "searching":true,
            "ordering": false,
            "ajax":{
                url:"dados/main.php",
                type:"POST",
                data:{action:'fetch'}
            },
            //aaData: data,
            //aoColumns:[
            //    { mDataProp: 'codigo'},
            //    { mDataProp: 'estado'},
            //    { mDataProp: 'designacao'},
            //    { mDataProp: 'orcamento', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
            //    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
            //    { mDataProp: 'orcamento_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
            //    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
            //    { mDataProp: 'faturado_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
            //]
            "columnDefs":[
                { targets: [0, 1, 2], className: 'dt-body-left' },
                { targets: [3, 4, 6], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','') },
                { targets: [5, 7], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '','%') }
                
            ]
        });

        //console.log("DADOS", columnDefs);
            

        }
    });