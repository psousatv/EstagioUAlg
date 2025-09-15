
function orcamentoTitulo(orcamentoItem) { 

  var params = new URLSearchParams(window.location.search);
  var orcamentoItem = params.get("orcamentoItem"); 
  //var anoCorrente = params.get("anoCorrente"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("orcamentoTitulo").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/orcamentoTitulo.php?orcamentoItem="+orcamentoItem,true);
  xmlhttp.send();

  valoresRubrica(orcamentoItem);
  valoresPADM(orcamentoItem);
 
};

function valoresRubrica(orcamentoItem) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("valoresRubrica").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/orcamentoResults.php?orcamentoItem="+orcamentoItem,true);
  xmlhttp.send();
 
};

function valoresPADM(orcamentoItem) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturacaoPADM").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/orcamentoFaturacaoPADM.php?orcamentoItem="+ orcamentoItem + "&anoCorrente=" + 2025,true);
  xmlhttp.send();
 
};

// Ao clicar no processo redireciona para o processo
function redirectProcesso(codigoProcesso){
  var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};
