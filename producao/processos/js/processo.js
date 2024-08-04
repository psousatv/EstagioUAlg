// Chamada de dados via PHP pelo método XMLHttpRequest

// Mome do Processo o Processo
function nomeProcesso(nomeProcesso) {
    if (nomeProcesso == "") {
      document.getElementById("idProcesso").innerHTML = "";
      return;
    } else {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          //document.getElementById("codigoProcesso").innerHTML = this.responseText;
          document.getElementById("idProcesso").innerHTML = this.responseText;
          //document.getElementById ("lstResumo").style.display = "none";
        }
      }

      xmlhttp.open("GET","dados/processoNome.php?nomeProcesso="+nomeProcesso,true);
      xmlhttp.send();

      resumoProcesso(28172);

    }
  };

// Resumo do Processo
function resumoProcesso(codigoProcesso) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstResumo").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoResumo.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();

};

// Facturação
function faturacaoProcesso(codigoProcesso) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturacao").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoFaturacao.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();

};

// Orcamento
function orcamentoProcesso(codigoProcesso) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstOrcamento").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoOrcamento.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();
};

// Histórico
function historicoProcesso(codigoProcesso) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstHistorico").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoHistorico.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();

};
