// Chamada de dados via PHP pelo método XMLHttpRequest

var processo;

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
      output = ' <div class="btn btn-primary col-md-12 d-grid small text-left">';
      output += nomeProcesso[0]["proces_check"] + " - ";
      output += nomeProcesso[0]["proces_padm"] + "_";
      output += nomeProcesso[0]["proces_nome"] + '</div>';
    }
      
    processo = nomeProcesso[0]['proces_check']
    
    document.getElementById("lstProcesso").innerHTML = output;
    
    resumoProcesso(processo);
    historicoProcesso(processo);
    faturacaoProcesso(processo);
    pagamentosProcesso(processo);

    console.log("processo",processo)
    console.log("nomeProcesso",nomeProcesso)

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
}

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

}

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
}

// Plano de Pagamentos
function pagamentosProcesso(codigoProcesso) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstPagamentos").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoPPagamentos.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();
}
