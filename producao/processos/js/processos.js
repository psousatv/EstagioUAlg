
//Esconde extras
function escondeElementos(){
  $("#showResultsProcesso").hide();
  $("#resultsWrapper").hide();
  $("#selecionadoWrapper").hide();
};

//Ativa extras
function mostraElementos(){
  $("#selecionadoWrapper").show();
};

// Chamada de dados via PHP pelo método XMLHttpRequest
// Procurar por Mome do Processo
function procuraProcesso(nomeProcesso) {
  $("#procuraProcesso").show();
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsProcesso").innerHTML = this.responseText;
        $("#showResultsProcesso").show();
      }
    }

    xmlhttp.open("GET","dados/processos.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

};

// Guarda o resultado da escolha 
function codigoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {

        //document.getElementById("nomeProcessoSelecionado").innerHTML = "output";

        resumoProcesso(codigo);
        historicoProcesso(codigo);
        faturacaoProcesso(codigo);
        pagamentosProcesso(codigo);
        $("#searchWrapper").hide();

      }
    }

    xmlhttp.open("GET","dados/processos.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

  };


  // Resumo do Processo
function resumoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstResumo").innerHTML = this.responseText;
      $("#resultsWrapper").show();
      $("#selecionadoWrapper").show();
    }
  }
  xmlhttp.open("GET","dados/processoResumo.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Histórico
function historicoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstHistorico").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/processoHistorico.php?codigoProcesso="+codigo,true);
  xmlhttp.send();

}

// Facturação
function faturacaoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturacao").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoFaturacao.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
}

// Plano de Pagamentos
function pagamentosProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstPagamentos").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoPPagamentos.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
}
