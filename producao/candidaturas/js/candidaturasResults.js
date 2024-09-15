

function candidaturaSelected(nomeCandidatura) { 

  var params = new URLSearchParams(window.location.search);
  var nomeCandidatura = params.get("nomeCandidatura"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("candidaturaSelected").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/candidaturaNome.php?nomeCandidatura="+nomeCandidatura,true);
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

  xmlhttp.open("GET","dados/candidaturasResults.php?nomeCandidatura="+nomeCandidatura,true);
  xmlhttp.send();
 
};