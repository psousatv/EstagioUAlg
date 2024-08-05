// Chamada de dados via PHP pelo método XMLHttpRequest

// Mome do Processo o Processo
function nomeProcesso() {
  var formNomeProcesso = document.getElementById('idProcesso').value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET","dados/processoNome.php?nomeProcesso=" + encodeURIComponent(formNomeProcesso), true);
  //xhr.open("GET","dados/processoNome.php?nomeProcesso="+nomeProcesso, true);
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var nomeProcesso = JSON.parse(xhr.responseText);
      var output = '';
      if (nomeProcesso.Erro){
        output = '<div class="btn btn-danger col-md-12 d-grid small text-center">' + resposta.Erro + '</div>'
      } else if (nomeProcesso.Mensagem) {
        output = '<div class="btn btn-info col-md-12 d-grid small text-center">' + resposta.Mensagem + '</div>'
      } else {
        output = ' <div class="btn btn-primary col-md-12 d-grid small text-left">';
        output += nomeProcesso[0]["proces_check"] + " - ";
        output += nomeProcesso[0]["proces_padm"] + "_";
        output += nomeProcesso[0]["proces_nome"] + '</div>';
      }
      
      document.getElementById("lstProcesso").innerHTML = output;
    }

    console.log("uriComponent", formNomeProcesso);
    console.log("response", nomeProcesso);

    resumoProcesso(nomeProcesso[0]["proces_check"]);
    historicoProcesso(nomeProcesso[0]["proces_check"]);
    faturacaoProcesso(nomeProcesso[0]["proces_check"]);
    orcamentoProcesso(nomeProcesso[0]["proces_check"]);

  };
  
  xhr.send();
}

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
