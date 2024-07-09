// Testes

$.ajax(
    {
    url: "dados/main.php",
    method: 'GET',
    contentType: 'application/json'
    }).done(
        function(data)
        {
            var dataTable = $('#tabela').DataTable({
                ordering: false,
                aaData: data,
                aoColumns:[
                    { mDataProp: 'codigo'},
                    { mDataProp: 'estado'},
                    { mDataProp: 'designacao'},
                    { mDataProp: 'orcamento', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
                    { mDataProp: 'orcamento_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'faturado_percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')}
                ]
            })
            
            console.log("DataTable Data:", data)

        }
    );