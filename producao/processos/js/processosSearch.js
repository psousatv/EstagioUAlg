// Passa o estado dos processos para HTML - Avisos
function avisos(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("Avisos").innerHTML = this.responseText;
    }
  }

  xmlhttp.open("GET","dados/processosAvisos.php");
  xmlhttp.send();

};

// Procurar por Mome do Processo
function procuraNomeProcesso(nomeProcesso) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    xmlhttp.open("GET","dados/processosSearchNome.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

};

// Procurar por Mome do Fornecedor
function procuraNomeFornecedor(nomeFornecedor) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    //document.getElementById("detailsWrapper").style.display = "none";
    xmlhttp.open("GET","dados/processosSearchFornecedor.php?nomeFornecedor="+nomeFornecedor,true);
    xmlhttp.send();  

};

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function processoSelected(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("Avisos").style.display = "none";

      var params = codigo;

      var URL = "processosResults.html?codigoProcesso=" + params;
      window.location.href = URL;
    }
  }

  xmlhttp.open("GET","dados/processosSearchNome.php?codigoProcesso="+ codigo, true);
  xmlhttp.send();

};
