var itemProcurado = String(itemProcurado)

function candidaturaSelected(itemProcurado) { 

  var params = new URLSearchParams(window.location.search);
  var itemProcurado = params.get("itemProcurado"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("candidaturaSelected").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/candidaturaTitulo.php?itemProcurado="+itemProcurado,true);
  xmlhttp.send();

  candidaturaProcessos(itemProcurado);
 
};

function candidaturaProcessos(itemProcurado) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstProcessos").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/candidaturaResults.php?itemProcurado="+itemProcurado,true);
  xmlhttp.send();
 
};

// Ao clicar no processo redireciona para o processo
function redirectProcesso(codigoProcesso){
  var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};
