
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = "../obras/dados/obraMetricas.php?codigoProcesso=" + codigoProcesso;

var obraMetricas = [];
var barraProgresso = [];

// Fetch JSON data from the PHP script
fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error (document.getElementById("lstMetricasProgressInstalacao").innerHTML = response.statusText);    
        }
        return response.json();
    })
    .then(fetchedData => {
        // Append the fetched data to the existing array
        obraMetricas = obraMetricas.concat(fetchedData);

        console.table(obraMetricas);

        // Dados para as Barras de ProgressO 
        //barraProgresso.push([obraMetricas[0]['objeto'], obraMetricas[0]['valor_proposto'], obraMetricas[0]['valor_trabalhos'],
        //    Math.round((obraMetricas[0]['valor_trabalhos'] / obraMetricas[0]['valor_proposto'])* 100, 2)
        //]);
        for(var i = 0; i < obraMetricas.length; i++){
            //if(
            //    obraMetricas[i]['infraestrutura'].match('AA_Condutas')
            //    obraMetricas[i]['objeto'] == 'Pavimentações' || 
            //    obraMetricas[i]['objeto'] == 'Movimento Terras' || 
            //    obraMetricas[i]['objeto'] == 'Tubagens' || 
            //    obraMetricas[i]['objeto'] == 'Acessórios' || 
            //    obraMetricas[i]['objeto'] == 'Ramais'
            //)
            {
            barraProgresso.push([
                obraMetricas[i]['trabalho'],
                obraMetricas[i]['valor_proposto'], 
                obraMetricas[i]['valor_trabalhos'],
                obraMetricas[i]['percentagem']
            ]);
            }
        };
       
        // Replica o Gráfico de Dados Gerias - DOM
        var oldCanvas = document.getElementById('lstObraGrafico');
        var newCanvas = document.getElementById('lstMetricasGrafico');
        var contexto = newCanvas.getContext('2d');
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        contexto.drawImage(oldCanvas, 0, 0);
         

        // Progress Bar
        // Contentores para agregar as barras de progresso
        const progressBarsContainer = document.getElementById('lstMetricasProgress');
        progressBarsContainer.innerHTML = "";
        // Função para crear una barra de progresso
        
        function createProgressBar(value)
        {
            // Contentores
            // 1
            const progressWrapper = document.createElement('div');
            progressWrapper.className = 'mt-2';
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
                if (width >= value[3]) {
                    clearInterval(interval);
                } else {
                    width++;
                    progressBar.style.width = width + '%';
                    //progressSpan.textContent = value[0] + ' - ' + value[1] + ' - ' + value[2];
                    progressSpan.textContent = value[0];
                    progressSpanBar.textContent = value[3] + '%';
                }

            }, 1);
        }

        // Atribuir os dados às barras de progresso
        // Atribui ao conotainer Pavimentações os valores do grupo
        barraProgresso.forEach(function(value){
            //if(value[0] == 'Instalação'){ 
                createProgressBar(value);
            //}    
        }
        );
    

    })
    .catch(error => {
        document.getElementById("lstMetricasProgress").innerHTML = error;
        //console.error("Error fetching the data:", error);
    });



//        var metricaProgress = document.getElementById("lstMetricasProgress");
//        obraMetricas.forEach((resultado) => {
//            var percentagem = Math.round((resultado['valor_trabalhos'] / resultado['valor_proposto'])* 100, 2);
//            var lstTitulos = `<div class='small'><a>
//            ${resultado['objeto']} - 
//            ${Number(resultado['valor_proposto']).toLocaleString('pt')} - 
//            ${Number(resultado['valor_trabalhos']).toLocaleString('pt')} -
//            ${Number(percentagem).toLocaleString('pt')}
//            </a></div>`;
//            //${Number(result["faturado"]).toLocaleString('pt')
//
//            //progresso.push(resultado["mt_designacao"], resultado["mt_item"]);
//            metricaProgress.innerHTML += lstTitulos;
//        });

        
