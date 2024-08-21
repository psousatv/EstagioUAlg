// Chamada de dados via PHP pelo método XMLHttpRequest

var processo = 0;
var codigoProcesso = 0;

// Mome do Processo o Processo
function nomeProcesso() {
  var formNomeProcesso = document.getElementById('idProcesso').value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET","dados/processoSearch.php?nomeSearch=" + encodeURIComponent(formNomeProcesso), true);
  //xhr.open("GET","dados/processoNome.php?nomeProcesso="+nomeProcesso, true);

  if(formNomeProcesso == '' ){
    console.log("Nome Digitado no formulário", formNomeProcesso);
    
    document.getElementById('detalhesProcesso').style.display = 'none';
    
  } else {
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var nomeProcesso = JSON.parse(xhr.responseText);
        var output = '';
        output = ' <div class="btn btn-primary col-md-12 d-grid small text-left">';
        output += nomeProcesso[0]["proces_check"] + " - ";
        output += nomeProcesso[0]["proces_padm"] + "_";
        output += nomeProcesso[0]["proces_nome"] + '</div>';
      }
      document.getElementById("lstProcesso").innerHTML = output;
     //document.getElementById("lstProcesso").innerHTML = this.responseText;
    
      processo = nomeProcesso[0]["proces_check"]; //nomeProcesso.proces_check

      console.log("nomeProcesso: ",nomeProcesso)
      console.log("processo: ", processo)

      resumoProcesso(processo);
      historicoProcesso(processo);
      faturacaoProcesso(processo);
      pagamentosProcesso(processo);
    
    }
  }

  xhr.send();

}


//Codigo Processo
function codigoProcesso(codigoProcesso) {
  var codigoProcesso = document.getElementById('showResultsProcesso').value;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("showResultsProcesso").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoResumo.php?codigoProcesso="+codigoProcesso,true);
  xmlhttp.send();

  resumoProcesso(codigoProcesso);
  historicoProcesso(codigoProcesso);
  faturacaoProcesso(codigoProcesso);
  pagamentosProcesso(codigoProcesso);
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
