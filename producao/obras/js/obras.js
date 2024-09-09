function escondeResultados(){
  document.getElementById("selectedProcesso").style.display = "none";
  document.getElementById("stepProgresso").style.display = "none";
  document.getElementById("buttonsProcesso").style.display = "none";
  document.getElementById("detailsWrapper").style.display = "none";
};

function mostraResultados(){
  document.getElementById("selectedProcesso").style.display = "block";
  document.getElementById("stepProgresso").style.display = "block";
  document.getElementById("buttonsProcesso").style.display = "block";
  document.getElementById("detailsWrapper").style.display = "block";
};

// Avisos
function avisos(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("Avisos").innerHTML = this.responseText;
    }
  }

 
  xmlhttp.open("GET","dados/obrasAvisos.php");
  xmlhttp.send();

};

// Procurar por Mome do Processo
function procuraProcesso(nomeProcesso) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    xmlhttp.open("GET","dados/obras.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

};

// Procurar por Mome do Fornecedor
function procuraFornecedor(nomeFornecedor) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("showResultsForm").innerHTML = this.responseText;
      }
    }

    //document.getElementById("detailsWrapper").style.display = "none";
    xmlhttp.open("GET","dados/obrasFornecedor.php?nomeFornecedor="+nomeFornecedor,true);
    xmlhttp.send();

};

// Escolha 
function codigoProcesso(codigo) {
  var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        
        document.getElementById("Avisos").style.display = "none";

        nome(codigo);
        //resumoProcesso(codigo);
        mapaTrabalhos(codigo);
        mapaAutos(codigo);
        //pagamentosProcesso(codigo);
        faturasProcesso(codigo);
        garantiasProcesso(codigo);
        
        mostraResultados();

      }
    }

    xmlhttp.open("GET","dados/obras.php?nomeProcesso="+nomeProcesso,true);
    xmlhttp.send();

  };

// Processo Selecionado
function nome(codigo) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      
      document.getElementById("selectedProcesso").innerHTML = this.responseText;
    }
  }

  document.getElementById("searchWrapper").style.display = "none";
  xmlhttp.open("GET","dados/obrasNome.php?codigoProcesso="+codigo,true);
  xmlhttp.send();
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
