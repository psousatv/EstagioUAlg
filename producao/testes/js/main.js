// Testes





$(document).ready(
    function()
    {
        fetch_data();
        function fetch_data()
        {
        var dataTable = $('#tabela').DataTable(
            {
            //"scrollY": 300,
            //"paging": false,
            //"searching": false,
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
                

                for(var count = 0; count < settings.aoData.length; count++){
                    dados.push(settings.aoData[count]._aData);
                    
                };

            console.log("Data", dados);

            }
            });
        }
    }
    );