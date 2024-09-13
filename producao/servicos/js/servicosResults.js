var processoCodigo = []

// Os resultados da Seleção é redirecionado para a processosResults.html
// Quando se seleciona um processo - obtem a identificação do processo e passa para o "Título"
function servicoSelected() { 

  var params = new URLSearchParams(window.location.search);
  var codigo = params.get("codigoProcesso"); 
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("servicoSelected").innerHTML = this.responseText;
    }
  }

  //console.log("Código passa do Search: ", codigo);

  xmlhttp.open("GET","dados/servicoShowNome.php?codigoProcesso="+codigo,true);
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
  
  xmlhttp.open("GET","dados/servicoMapaTrabalhos.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Mapa de Situacao
function mapaAutos(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstMapaSituacao").innerHTML = this.responseText;
      
    }
  }

  xmlhttp.open("GET","dados/servicoMapaSituacao.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
};

// Facturas
function faturasProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("lstFacturas").innerHTML = this.responseText;
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
