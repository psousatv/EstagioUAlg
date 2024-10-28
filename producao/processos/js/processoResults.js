var processoCodigo = []

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function processoSelected() { 

  var params = new URLSearchParams(window.location.search);
  var codigo = params.get("codigoProcesso"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("processoSelected").innerHTML = this.responseText;

      processoCodigo.push(codigo);
    }
  }

  xmlhttp.open("GET","dados/processoTitulo.php?codigoProcesso="+codigo,true);
  xmlhttp.send();

        resumoProcesso(codigo);
        historicoProcesso(codigo);
        relacoesProcesso(codigo);
        pagamentosProcesso(codigo); // Plano de Pagamentos
        faturacaoProcesso(codigo); // Facturação
        //orcamentoProcesso(codigo); // Orçamento
        faturasProcesso(codigo); // Detalhes daas Faturas
        garantiasProcesso(codigo);

};

// Resumo do Processo
function resumoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      data = document.getElementById("lstResumo").innerHTML = this.responseText;
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
};

// Relacoes
function relacoesProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstRelacoes").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/processoRelacoes.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Facturação
function faturacaoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturacao").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/processoFinanceiro.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Plano de Pagamentos
function pagamentosProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstPagamentos").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/processoFinanceiro2.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Orçamento
//function orcamentoProcesso(codigo) {
//  var xmlhttp = new XMLHttpRequest();
//  xmlhttp.onreadystatechange = function() {
//    if (this.readyState == 4 && this.status == 200) {
//      document.getElementById("lstOrcamento").innerHTML = this.responseText;
//    }
//  }
//
//  xmlhttp.open("GET","dados/processoFinanceiro3.php?codigoProcesso="+codigo,true);
//  xmlhttp.send();
//};

// Facturas
function faturasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturas").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoFaturas.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};


// Facturas
function garantiasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstGarantias").innerHTML = this.responseText;
    }

    
  }
  
  xmlhttp.open("GET","dados/processoGarantias.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Botões
// Ao clicar nos botões, redirecina para a página ou rotina selecionada
function redirectButtons(){
  var obrasURL = "../../producao/obras/obraResults.html?codigoProcesso=" + processoCodigo;
  window.location.href = obrasURL;
};

function returnToOrigin(){
  var URL = "../../producao/obras/obrasResults.html?codigoProcesso=" + processoCodigo;
  window.location.href = URL;
};

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function redirectProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //document.getElementById("Avisos").style.display = "none";

      var params = codigo;

      var URL = "processoResults.html?codigoProcesso=" + params;
      window.location.href = URL;
    }
  }

  xmlhttp.open("GET","../_search/searchEngine.php?codigoProcesso="+ codigo, true);
  xmlhttp.send();

};