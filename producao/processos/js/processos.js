function escondeResultados(){
  document.getElementById("showResultsProcesso").style.display = "none";
  document.getElementById("selecionadoWrapper").style.display = "none";
  
};

// Procurar por Mome do Processo
function procuraProcesso(nomeProcesso) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsProcesso").innerHTML = this.responseText;
      }
    }

    xmlhttp.open("GET","dados/processos.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

};

// Guarda o resultado da escolha 
function codigoProcesso(codigo) {
  document.getElementById("searchWrapper").style.display = "none";
  document.getElementById("selecionadoWrapper").style.display = "block";

  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        
        nome(codigo);
        resumoProcesso(codigo);
        historicoProcesso(codigo);
        faturacaoProcesso(codigo);
        pagamentosProcesso(codigo);

      }
    }

    xmlhttp.open("GET","dados/processos.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

  };

// Nome do Processo
function nome(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("nomeProcessoSelecionado").innerHTML = this.responseText;
    }
  }
  xmlhttp.open("GET","dados/processoNome.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

  // Resumo do Processo
function resumoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstResumo").innerHTML = this.responseText;
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
