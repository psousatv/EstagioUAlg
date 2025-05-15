
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = "../obras/dados/obraComponentes.php?codigoProcesso=" + codigoProcesso;

var resultados = [];
var dados = [];

// Fetch JSON data from the PHP script
fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error (document.getElementById("lstComponentes").innerHTML = response.statusText);    
        }
        return response.json();
    })
    .then(returnedData => {
        // Append the fetched data to the existing array
        resultados = resultados.concat(returnedData);

        var tabelaComponentes = document.getElementById("lstComponentes");

        resultados.forEach((resultado) => {
        
            dados.push(resultado["mt_check"]);
            tabelaComponentes.innerHTML += resultados;
        });

        console.log("Resultados: ", dados);
    })
    .catch(error => {
        document.getElementById("lstComponentes").innerHTML = error;
        //console.error("Error fetching the data:", error);
    });

