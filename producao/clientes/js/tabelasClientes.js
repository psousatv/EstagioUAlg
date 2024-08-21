

var dataTable = $('#tabela').DataTable({
    processing: true,
    serverSide: true,
    myDataTable: [],
    ajax:{
        url:"clientes/dashboard/dashCadastroClientes.php",
        type:"POST",
        data:{action:'fetch'}
    },
    columnDefs:[
        { targets: [2, 3, 4], className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '') },
        { targets: [0, 1], className: 'dt-body-left' }
    ],
    drawCallback: function(settings){
        var tabela_valor_x = [];
        var tabela_valor_y = [];
        for(var count = 0; count < settings.aoData.length; count++){
        tabela_valor_x.push(settings.aoData[count]._aData[0]);
        tabela_valor_y.push(parseFloat(settings.aoData[count]._aData[2]));
        }
    }
    });

