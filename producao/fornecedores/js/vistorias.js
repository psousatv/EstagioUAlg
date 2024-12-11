
//var params = new URLSearchParams(window.location.search);
//var codigoProcesso = params.get("codigoProcesso"); 
var url = "dados/fornVistorias.php";
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
        throw new Error (document.getElementById('alerta').innerHTML = response.statusText);    
    }
    return response.json();
})
.then(returnedData => {
    //resultados.push(...data);
    document.getElementById("alerta").style.display = "none";

    resultados = resultados.concat(returnedData);

    var date = new Date();
    var dia = date.getDate();
    //var mes = date.getMonth();

    console.log("Dia: ", dia);

    var mes = date.getMonth(); 

   resultados.forEach((resultado) =>{
        if(
            mes == resultado["mes"] &&
            resultado["doc"] == 'Programado' && 
            resultado["obs"] == 'Programado') {
                //vistoriasProgramadas.push(resultado["data_registo"]);
                vistoriasProgramadas = vistoriasProgramadas.concat(resultado);
        } else if (
            resultado["doc"] != 'Programado' && 
            resultado["obs"] == 'Agendado') {
                //vistoriasAgendadas.push(resultado["data_registo"]);
                vistoriasAgendadas = vistoriasAgendadas.concat(resultado);
        }else if (
            mes + 1 >= resultado["mes"] &&
            resultado["doc"] == 'Programado' && 
            resultado["obs"] == 'Programado') {
                //vistoriasVencidas.push(resultado["data_registo"]);
                vistoriasVencidas = vistoriasVencidas.concat(resultado);
        };
    });

     // Envia os resultados para o Container correspondente
     //Programados
     var containerProgramado = document.getElementById('programado');
     containerProgramado.innerHTML = "";
 
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
                    <li class="small"><b>Custo Previsto: ${Number(programado["valor"]).toLocaleString('pt')}€ </b></li>
                </ul>
            </a>`;
            
        if(programado["mes"] > 0){
            containerProgramado.innerHTML += listaProgramado;

        }
    });

    //Vencidos
    var containerVencido = document.getElementById('vencido');
    containerVencido.innerHTML = "";
 
    vistoriasVencidas.forEach((vencido) => {

        var listaVencido = `
            <a class="list-group-item flex-column align-items-start" onclick="redirectProcesso(${vencido['processo']})">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${vencido['data_registo']}</h5>
                <small class="badge badge-danger">${vencido['tipo']} - ${vencido['actividade']}</small>
                <span>
                    <i class="fa fa-binoculars" onclick="redirectProcesso(${programado['processo']})"></i>
                    </span>
                </div>
                <li class="mb-1 small">[${vencido['processo']}] ${vencido['designacao']}</li>
                <ul>
                    <li class="small"><b>Entidade: ${vencido['entidade']} </b></li>
                    <li class="small"><b>Recepção Provisória: ${vencido['recepcao']} </b></li>
                    <li class="small"><b>Custo Previsto: ${Number(vencido["valor"]).toLocaleString('pt')}€ </b></li>
                </ul>
            </a>`;
            
        if(vencido["mes"] > 0){
            containerVencido.innerHTML += listaVencido;

        }
    });

    //Agendados
    var containerAgendado = document.getElementById('agendado');
    containerAgendado.innerHTML = "";
 
    vistoriasAgendadas.forEach((agendado) => {

        var listaAgendado = `
            <a class="list-group-item flex-column align-items-start" onclick="redirectProcesso(${agendado['processo']})">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${agendado['data_registo']}</h5>
                <small class="badge badge-primary">${agendado['tipo']} - ${agendado['actividade']}</small>
                <span>
                    <i class="fa fa-binoculars" onclick="redirectProcesso(${programado['processo']})"></i>
                    </span>
                </div>
                <li class="mb-1 small">[${agendado['processo']}] ${agendado['designacao']}</li>
                <ul>
                    <li class="small"><b>Entidade: ${agendado['entidade']}</b></li>
                    <li class="small"><b>Recepção Provisória: ${agendado['recepcao']}</b></li>
                    <li class="small"><b>Custo Previsto: ${Number(agendado["valor"]).toLocaleString('pt')}€ </b></li>
                </ul>
            </a>`;
            
        if(agendado["mes"] > 0){
            containerAgendado.innerHTML += listaAgendado;

        }
    });

})
    .catch(error => {
        document.getElementById('alerta').innerHTML = error;
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