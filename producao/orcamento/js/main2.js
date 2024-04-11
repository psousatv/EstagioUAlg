var allData = [];
var tipo= [];
var rubrica= [];
var item= [];
var barraProgresso = [];
var y1= [];
var y2= [];
var y3= [];

$.ajax(
    {
    url: "dados/main1.php",
    method: 'GET',
    contentType: 'application/json'
    })
    .done(
        function(data)
        {
            var dataTable = $('#tabela').DataTable({
                //data:{action:'fetch'},
                aaData: data, 
                aoColumns:[
                    //{ mDataProp: 'tipo'},
                    { mDataProp: 'rubrica'},
                    //{ mDataProp: 'item'},
                    { mDataProp: 'orcamento', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'adjudicado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                    { mDataProp: 'percent', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '%')},
                    { mDataProp: 'faturado', className: 'dt-body-right', "render": $.fn.dataTable.render.number('.', ',', 2, '')},
                ]

            })

            dataTable.rows().every(
                function(){
                    var rowData = this.data();
                    // Todos os dados de Datatable (data) para array local
                    allData.push(rowData);

                    //tipo.push(rowData["tipo"]);
                    rubrica.push(rowData["rubrica"]);
                    //item.push(rowData["item"]);
                    barraProgresso.push([rowData["rubrica"],rowData["percent"]]);

                    y1.push(rowData["orcamento"]);
                    y2.push(rowData["adjudicado"]);
                    y3.push(rowData["faturado"]);
                }

            );

        }
    );


    console.log("allData", allData);
    console.log("y1", y1);
    console.log("Rubrica", rubrica);

// Função para somar valores de uma propriedade ('campo') do objecto ('dados')
var sumByProperty = (allData, property) => {
    return allData.reduce((sums, obj) => {
        const key = obj[property];
        // Assumindo que se quer somar o 'valor_maximo'
        sums[key] = (sums[key] || 0) + obj.orcamento;
        return sums;
    }, 
    {});
};

var sumByPropertyAndFilter = (allData, sumProperty, filterProperty, filterValue) => {
    return allData
    .filter(obj => obj[filterProperty] === filterValue)
    .reduce((sums, obj) => {
        var key = obj[sumProperty];
        sums[key] = (sums[key] || 0) + obj.orcamento; // Assuming we want to sum the 'age' property
        return sums;
    }, 
    {});
};


// Soma agrupando
//var SomaPorTipo = sumByProperty(allData, 'tipo');
var SomaPorRubrica = sumByProperty(allData, 'rubrica');
//var SomaPorItem = sumByProperty(allData, 'item');
// Soma os Valores agrupando por Rubrica e filtrado por Tipo de de Despesa = Investimentos
//var SomaPorRubrica = sumByPropertyAndFilter(data, 'rubrica', 'tipo', 'item');

//console.log("SomaPorTipo", SomaPorTipo);
console.log("SomaPorRubrica", SomaPorRubrica);
//console.log("SomaPorItem", SomaPorItem);


// ** Gráficos
var grafico;
var chart_data = {
    labels: rubrica,
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
        }]
    };

var group_chart = $('#grafico');
if(grafico)
{
    grafico.destroy();
}

grafico = new Chart(group_chart,
    {
        type: 'bar',
        data: chart_data
    });

// Progress Bar
                // Contentores para agregar as barras de progresso
                const progressBarsContainer = document.getElementById('barraProgresso');
                //progressBarsContainer.innerHTML = "";
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
                        if (width >= value) {
                            clearInterval(interval);
                        } else {
                            width++;
                            progressBar.style.width = width + '%';
                            progressSpan.textContent = value;
                            progressSpanBar.textContent = value + '%';
                        }

                    }, 1);

                    
                    console.log("value", value)
                }

                // Atribuir os dados às barras de progresso
                barraProgresso.forEach(function(value)
                {
                    createProgressBar(value);

                });

                // Iniciar as barras de progresso quando se acede à Página
                window.addEventListener('load', function(){
                    createProgressBar();
                });

console.log("barraProgresso", barraProgresso)


// ** Cartões
var container = document.getElementById('cartoesEsquerdaGrafico');
//container.innerHTML = "";

allData.forEach(
    (result, idx) => {
        // Create card element
        var classeCartao = ''
        var iconeCartao = ''
        if (result["percent"] < 10) {
            var classeCartao = 'bg-danger';
            var iconeCartao = 'fa-thumbs-down'
        } else if (result["percent"] > 10 & result["percent"]< 35){
            var classeCartao = 'bg-warning';
            var iconeCartao = 'fa-warning'
        } else if (result["percent"] >35 & result["percent"] < 75){
            var classeCartao = 'bg-primary';
            var iconeCartao = 'fa-cogs'
        } else {
            var classeCartao = 'bg-success';
            var iconeCartao = 'fa-smile'
        };

        var card = document.createElement('div');
        card.classList = 'card-body';

        var cartoes = `
                    <div class="col-xl-12 col-md-6 stretch-card grid-margin grid-margin-sm-0 pb-sm-3" >
                    <div class="card ${classeCartao}">
                    <div class="card-body">
                    <div class="d-flex justify-content-between px-md-1">
                    <div class="text-end">
                        <p class="mb-0 text-white">${result["item"]}</p>
                        <!--Faturado-->
                        <h3 class="text-white">${Number(result["adjudicado"]).toLocaleString('pt')}€<span class="h6">- ${result["percent"]}%</span></h3>
                        <!--Adjudicado-->
                        <h6 class="text-white">${Number(result["orcamento"]).toLocaleString('pt')}€<span class="h6"> </span></h6>
                    </div>
                    <div class="align-self-center">
                        <i class="fas ${iconeCartao} text-white fa-3x"></i>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>
                    `;

        // Append newyly created card element to the container
            container.innerHTML += cartoes;
    }
);

