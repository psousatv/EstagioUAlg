// Chamada de dados via PHP pelo método XMLHttpRequest

// Procurar por Mome ds Processo
function procuraProcesso() {
  var nomeProcesso = document.getElementById('nomeProcesso').value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET","dados/processoSearch.php?nomeProcesso=" + encodeURIComponent(nomeProcesso), true);
  //xhr.open("GET","dados/processoNome.php?nomeProcesso="+nomeProcesso, true);

  if(nomeProcesso != ''){

    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var processo = JSON.parse(xhr.responseText);
        var output = '';
        for(var i=0; i < processo.length; i++){
        
        output = processo[i]["proces_check"] + " - ";
        output += processo[i]["proces_padm"] + "_";
        output += processo[i]["proces_nome"] + '</div>';
        }
      }
    
      document.getElementById("showResultsProcesso").innerHTML = output;
      document.getElementById('opcoesProcesso').style.display = 'none';

     //document.getElementById("lstProcesso").innerHTML = this.responseText;
    
      var processoCheck = processo[0]["proces_check"]; //nomeProcesso.proces_check
      
      console.log("Nome Digitado no formulário", nomeProcesso);
      console.log("Nome Devolvido pelo servidor", Processo);
      console.log("Código do processo resultante da resposta do servidor xx[0]['proces_check']: ", processoCheck);
    }
     } else {
      document.getElementById('opcoesProcesso').style.display = 'none';
    }
    
    xhr.send();
  }
