// Passa o estado dos processos para HTML - Avisos
function candidaturaSelected(nomeCandidatura){

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var URL = "candidaturasResults.html?nomeCandidatura=" + nomeCandidatura;
      window.location.href = URL;

      //document.getElementById("lstProcessos").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/main.php?nomeCandidatura="+ nomeCandidatura);
  xmlhttp.send();

};
