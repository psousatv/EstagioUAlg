var processoCodigo = []

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function obraSelected() { 

  var params = new URLSearchParams(window.location.search);
  var codigo = params.get("codigoProcesso"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("obraSelected").innerHTML = this.responseText;
    }
  }

  //console.log("Código passa do Search: ", codigo);

  xmlhttp.open("GET","dados/obraTitulo.php?codigoProcesso="+codigo,true);
  xmlhttp.send();

          mapaTrabalhos(codigo);
          mapaAutos(codigo);
          faturasProcesso(codigo);
          garantiasProcesso(codigo);
 
};

// Mapa de Trabalhos
function mapaTrabalhos(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstMapaTrabalhos").innerHTML = this.responseText;
    }
  }
  
  xmlhttp.open("GET","dados/obraMapaTrabalhos.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Mapa de Situacao
function mapaAutos(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstMapaSituacao").innerHTML = this.responseText;
      
    }
    console.log("Resposta: ", this.responseText);
  }

  xmlhttp.open("GET","dados/obraMapaSituacao.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Facturas
function faturasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFaturas").innerHTML = this.responseText;
    }

    
  }
  
  xmlhttp.open("GET","../processos/dados/processoFaturas.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Garantias
function garantiasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstGarantias").innerHTML = this.responseText;
    }

    
  }
  
  xmlhttp.open("GET","../processos/dados/processoGarantias.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};
