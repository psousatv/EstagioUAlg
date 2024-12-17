
//var params = new URLSearchParams(window.location.search);
//var codigoProcesso = params.get("codigoProcesso"); 
var url = "dados/fornecedoresVistorias.php";
var resultados = [];
var vistoriasProgramadas = [];
var vistoriasAgendadas = [];
var vistoriasVencidas = [];

//Funcção
vistorias();

// Fetch JSON data from the PHP script
function vistorias(){
fetch(url)
.then(response => {
    if(!response.ok){
        throw new Error (document.getElementById('lstErros').innerHTML = response.statusText);    
    }
    return response.json();
})
.then(returnedData => {
    //resultados.push(...data);
    document.getElementById("lstErros").style.display = "none";

    resultados = resultados.concat(returnedData);

    var date = new Date();
    var dia = date.getDate();
    var ano = date.getFullYear();
    var mes = date.getMonth();

    console.log("Ano", ano);
    console.log("Mes", mes);   
    

   resultados.forEach((resultado) =>{
    //Programado - se o mês registado é o mês atual
        if(
            resultado["ano"] >= ano &&
            resultado["mes"] > mes &&
            resultado["doc"] == 'Programado' && 
            resultado["obs"] == 'Programado') {
                if(resultado["recepcao"] == null) {
                    resultado["recepcao"] == 'n.a.'
                };
                //vistoriasProgramadas.push(resultado["data_registo"]);
                vistoriasProgramadas = vistoriasProgramadas.concat(resultado);
                //console.log("Programadas", resultado);
        } else if (
        // Agendadas - Se o mês registado é superior ao mês atual
            //parseInt(resultado["mes"]) >= mes &&
            resultado["doc"] == 'Agendado' && 
            resultado["obs"] == 'Agendado') {
                if(resultado["recepcao"] == null) {
                    resultado["recepcao"] == 'n.a.'
                };
                //vistoriasAgendadas.push(resultado["data_registo"]);
                vistoriasAgendadas = vistoriasAgendadas.concat(resultado);
                //console.log("Agendadas", resultado);
        }else if (
        // Vencidas - Se o mes registado é inferior ao mês atual
            resultado["ano"] <= ano &&
            resultado["mes"] <= mes &&
            resultado["doc"] == 'Programado' && 
            resultado["obs"] == 'Programado') {
                if(resultado["recepcao"] == null) {
                    resultado["recepcao"] == 'n.a.'
                };
                vistoriasVencidas = vistoriasVencidas.concat(resultado);
        } else {
                 
            vistoriasProgramadas = vistoriasProgramadas.concat(resultado);
            };
    });


    console.log("Programadas", vistoriasProgramadas);
    console.log("Agendados", vistoriasAgendadas);
    console.log("Vencidas", vistoriasVencidas);

     // Envia os resultados para o Container correspondente
     //Programados
     var containerProgramado = document.getElementById('programado');
     containerProgramado.innerHTML = "";
     var vistoriasProgramadasNum = vistoriasProgramadas.length;

    vistoriasProgramadas.forEach((programado) => {
        var listaProgramado = `
            <a class="list-group-item flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${programado['data_registo']}</h5>
                    <span class="badge badge-success">${programado['tipo']} - ${programado['actividade']}</span>
                    <span>
                    <i class="fa fa-binoculars" onclick="redirectProcesso(${programado['processo']})"></i>
                    </span>
                </div>
                <li class="mb-1 small">[${programado['processo']}] ${programado['designacao']}</li>
                <ul>
                    <li class="small"><b>Entidade: ${programado['entidade']}</b></li>
                    <li class="small"><b>Recepção Provisória: ${programado['recepcao']}</b></li>
                    <li class="small"><b>Pedido: ${programado['doc']}</b></li>
                    <li class="small"><b>Custo Previsto: ${Number(programado["valor"]).toLocaleString('pt')}€ [${programado['doc_num']}]</b></li>
                </ul>
            </a>`;
            
        if(parseInt(programado["ano"]) > 0){
            containerProgramado.innerHTML += listaProgramado;
        }
    });

    //Vencidos
    var containerVencido = document.getElementById('vencido');
    containerVencido.innerHTML = "";
    var vistoriasVencidasNum = vistoriasVencidas.length;
 
    vistoriasVencidas.forEach((vencido) => {

        var listaVencido = `
            <a class="list-group-item flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${vencido['data_registo']}</h5>
                <small class="badge badge-danger">${vencido['tipo']} - ${vencido['actividade']}</small>
                <span>
                    <i class="fa fa-binoculars" onclick="redirectProcesso(${vencido['processo']})"></i>
                    </span>
                </div>
                <li class="mb-1 small">[${vencido['processo']}] ${vencido['designacao']}</li>
                <ul>
                    <li class="small"><b>Entidade: ${vencido['entidade']} </b></li>
                    <li class="small"><b>Recepção Provisória: ${vencido['recepcao']} </b></li>
                    <li class="small"><b>Pedido: ${vencido['doc']}</b></li>
                    <li class="small"><b>Custo Previsto: ${Number(vencido["valor"]).toLocaleString('pt')}€ [${vencido['doc_num']}] </b></li>
                </ul>
            </a>`;
            
        if(vencido["ano"] > 0){
            containerVencido.innerHTML += listaVencido;

        }
    });

    //Agendados
    var containerAgendado = document.getElementById('agendado');
    containerAgendado.innerHTML = "";
    var vistoriasAgendadasNum = vistoriasAgendadas.length;
 
    vistoriasAgendadas.forEach((agendado) => {

        var listaAgendado = `
            <a class="list-group-item flex-column align-items-start">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${agendado['data_registo']}</h5>
                <small class="badge badge-primary">${agendado['tipo']} - ${agendado['actividade']}</small>
                <span>
                    <i class="fa fa-binoculars" onclick="redirectProcesso(${agendado['processo']})"></i>
                    </span>
                </div>
                <li class="mb-1 small">[${agendado['processo']}] ${agendado['designacao']}</li>
                <ul>
                    <li class="small"><b>Entidade: ${agendado['entidade']}</b></li>
                    <li class="small"><b>Recepção Provisória: ${agendado['recepcao']}</b></li>
                    <li class="small"><b>Pedido: ${agendado['doc']}</b></li>
                    <li class="small"><b>Custo Previsto: ${Number(agendado["valor"]).toLocaleString('pt')}€ [${agendado['doc_num']}] </b></li>
                </ul>
            </a>`;
            
        if(agendado["ano"] > 0){
            containerAgendado.innerHTML += listaAgendado;
        }
    });

})
    .catch(error => {
        document.getElementById('lstErros').innerHTML = error;
    });
};


// Os resultados da Seleção é redirecionado para a processosResults.html
function redirectProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var params = codigo;
      var URL = "../processos/processoResults.html?codigoProcesso=" + params;
      //window.open(URL, "_blank");
      window.location.href = URL;
    }
  }

  xmlhttp.open("GET","../_search/searchEngine.php?codigoProcesso="+ codigo, true);
  xmlhttp.send();

};