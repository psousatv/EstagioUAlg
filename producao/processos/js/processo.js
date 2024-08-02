// Chamada de dados via PHP pelo método XMLHttpRequest

// Seleciona o Processo
function mostraProcesso(str) {
    if (str == "") {
      document.getElementById("lstProcesso").innerHTML = "";
      return;
    } else {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.getElementById("lstProcesso").innerHTML = this.responseText;
        }
      }
      
      xmlhttp.open("GET","dados/processoSelect.php?processo="+str,true);
      xmlhttp.send();

      faturacaoProcesso(str);
      historicoProcesso(str);
      orcamentoProcesso(str);
      nomeProcesso(str);
      
    }
  };

// Teste
function nomeProcesso(str) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("nomeProcesso").innerHTML = this.responseText;
    }
  };
  
  xmlhttp.open("GET","dados/processoNome.php?processo="+str,true);
  xmlhttp.send();

}

// Facturação
function faturacaoProcesso(str) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturacao").innerHTML = this.responseText;
    }
  };
  
  xmlhttp.open("GET","dados/processoFaturacao.php?processo="+str,true);
  xmlhttp.send();

}

// Orcamento
function orcamentoProcesso(str) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstOrcamento").innerHTML = this.responseText;
    }
  };
  
  xmlhttp.open("GET","dados/processoOrcamento.php?processo="+str,true);
  xmlhttp.send();
}

// Histórico
function historicoProcesso(str) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstHistorico").innerHTML = this.responseText;
    }
  };
  
  xmlhttp.open("GET","dados/processoHistorico.php?processo="+str,true);
  xmlhttp.send();

}
