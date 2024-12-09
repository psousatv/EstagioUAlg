
var processoCodigo = []

function redirectVistorias() {

  document.write('<script type="text/javascript" src="js/vistorias.js"></script>');

};

// Os resultados da Seleção é redirecionado para a processosResults.html
function redirectProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var params = codigo;
      var URL = "../processos/processoResults.html?codigoProcesso=" + params;
      //window.open(URL, "_blank");
      window.location.href = URL;
    }
  }

  xmlhttp.open("GET","../_search/searchEngine.php?codigoProcesso="+ codigo, true);
  xmlhttp.send();

};