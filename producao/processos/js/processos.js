// Chamada de dados via PHP pelo método XMLHttpRequest



function mostraProcessos(str) {
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
      xmlhttp.open("GET","../dados/processos.php?processo="+str,true);
      xmlhttp.send();
    }
  }
