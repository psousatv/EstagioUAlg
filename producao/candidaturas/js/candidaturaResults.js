var processoCodigo = []

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function candidaturaSelected() { 

  var params = new URLSearchParams(window.location.search);
  var nomeCandidatura = params.get("nomeCandidatura"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstProcessos").innerHTML = this.responseText;
    }
  }

  //console.log("Código passa do Search: ", codigo);

  xmlhttp.open("GET","dados/candidaturaResults.php?nomeCandidatura="+nomeCandidatura,true);
  xmlhttp.send();

 
};