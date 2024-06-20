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


    $.ajax({
        url : 'dados/main.php', // my php file
        type : 'GET', // type of the HTTP request
        success : function(data){ 
           //var obj = jQuery.parseJSON(data);
           
           var container = document.getElementById('lista');
           
           data.forEach((result) => {
           var lista = `
                   <div>
                       <p>
                       ${result["codigo"] + " " +  result["estado"] + " " + result["designacao"] + " " + 
                       Number(result["adjudicado"]).toLocaleString('pt') + " " + result["orcamento_percent"] + "%" + " " +
                       Number(result["faturado"]).toLocaleString('pt')}
                       </p>
                   </div>
           `;

           container.innerHTML += lista;

           });

        }
     });