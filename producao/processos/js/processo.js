// Chamada de dados via PHP pelo método XMLHttpRequest


// Seleciona o Processo
function mostraProcesso(str) {
    if (str == "") {
      document.getElementById("idProcesso").innerHTML = "";
      return;
    } else {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.getElementById("idProcesso").innerHTML = this.responseText;
        }
      };
      
      xmlhttp.open("GET","dados/processoSelect.php?processo="+str,true);
      xmlhttp.send();

      historicoProcesso(str);
      
    }
  }

// Histórico do Processo
function historicoProcesso(str) {
  if (str == "") {
    document.getElementById("listaHistorico").innerHTML = "";
    return;
  } else {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("listaHistorico").innerHTML = this.responseText;
      }
    };
    xmlhttp.open("GET","dados/processoHistorico.php?processo="+str,true);
    xmlhttp.send();
  }
}

