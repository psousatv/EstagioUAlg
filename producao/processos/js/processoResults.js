
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
        fasesProcesso(codigo); // Milestones
        resumoCCP(codigo);
        relacoesProcesso(codigo);
        Financeiro(codigo);
        //pagamentosProcesso(codigo); // Plano de Pagamentos
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

// Fases do Processo - Milestones
function fasesProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFasesProcesso").innerHTML = this.responseText;

      //console.log("Milestones: ", this.responseText);
    }
  }
  xmlhttp.open("GET","dados/processoMilestones.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// REsumo do Processo - Enquadramento CCP
function resumoCCP(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstResumoCCP").innerHTML = this.responseText;

      //console.log("Milestones: ", this.responseText);
    }
  }
  xmlhttp.open("GET","dados/processoResumoCCP.php?codigoProcesso="+codigo,true);
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

// Plano de Pagamentos
//function pagamentosProcesso(codigo) {
//  var xmlhttp = new XMLHttpRequest();
//  xmlhttp.onreadystatechange = function() {
//    if (this.readyState == 4 && this.status == 200) {
//      document.getElementById("lstPagamentos").innerHTML = this.responseText;
//    }
//  }
//
//  xmlhttp.open("GET","dados/processoFinanceiro.php?codigoProcesso="+codigo,true);
//  xmlhttp.send();
//};

//Financeiro
function Financeiro(codigoProcesso){
  //const codigoProcesso = new URLSearchParams(window.location.search).get("codigoProcesso");
  // Carregar tabelas financeiras
  ProcessoObra.Financeiro.carregar(codigoProcesso, 'tabelaPrevisto', 'tabelaRealizado');
  // Carregar cartões
  ProcessoObra.Cartoes.carregar(codigoProcesso, 'lstObraCartoes', 'cartaoGrauExecucao');
  // Criar gráfico
  ProcessoObra.Grafico.criar(codigoProcesso, 'lstObraGrafico');
};

// Facturas
function faturasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturas").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/processoFaturas.php?codigoProcesso=" + codigo,true);
  xmlhttp.send();
};

// Garantias
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
// Ao clicar nos botões, redireciona para a página ou rotina selecionada
function redirectObras(){
  var obrasURL = "../../producao/obras/obraResults.html?codigoProcesso=" + processoCodigo;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};

function redirectHome(){
  var URL = "../../producao/obras/processoSearch.html";
  //window.open(URL, "_blank");
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
      //window.open(URL, "_blank");
      window.location.href = URL;
    }
  }

  xmlhttp.open("GET","../_search/searchEngine.php?codigoProcesso="+ codigo, true);
  xmlhttp.send();

};

function redirectInformacoesCPV(){
  window.alert("Futuramente listará as Aquisições da mesma natureza");
};