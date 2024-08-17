function escondeResultados(){
  document.getElementById("selectedProcesso").style.display = "none";
  document.getElementById("buttonsProcesso").style.display = "none";
  document.getElementById("detailsWrapper").style.display = "none";
};

function mostraResultados(){
  document.getElementById("detailsWrapper").style.display = "block";
  document.getElementById("selectedProcesso").style.display = "block";
  document.getElementById("buttonsProcesso").style.display = "block";
};

// Procurar por Mome do Processo
function procuraProcesso(nomeProcesso) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    //document.getElementById("detailsWrapper").style.display = "none";
    xmlhttp.open("GET","dados/processos.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

};

// Procurar por Mome do Fornecedor
function procuraFornecedor(nomeFornecedor) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    //document.getElementById("detailsWrapper").style.display = "none";
    xmlhttp.open("GET","dados/processosFornecedor.php?nomeFornecedor="+nomeFornecedor,true);
    xmlhttp.send();

};

// Guarda o resultado da escolha 
function codigoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        
        nome(codigo);
        resumoProcesso(codigo);
        historicoProcesso(codigo);
        faturacaoProcesso(codigo);
        pagamentosProcesso(codigo);
        mostraResultados();

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
      
      document.getElementById("selectedProcesso").innerHTML = this.responseText;
    }
  }

  document.getElementById("searchWrapper").style.display = "none";
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
