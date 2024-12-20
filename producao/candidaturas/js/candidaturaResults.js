

function candidaturaSelected(nomeCandidatura) { 

  var params = new URLSearchParams(window.location.search);
  var nomeCandidatura = params.get("nomeCandidatura"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("candidaturaSelected").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/candidaturaTitulo.php?nomeCandidatura="+nomeCandidatura,true);
  xmlhttp.send();

  candidaturaProcessos(nomeCandidatura);
 
};

function candidaturaProcessos(nomeCandidatura) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstProcessos").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/candidaturaResults.php?nomeCandidatura="+nomeCandidatura,true);
  xmlhttp.send();
 
};

// Ao clicar no processo redireciona para o processo
function redirectProcesso(codigoProcesso){
  var obrasURL = "../../producao/processos/processoResults.html?codigoProcesso=" + codigoProcesso;
  //window.open(obrasURL, "_blank");
  window.location.href = obrasURL;
};
