
var params = new URLSearchParams(window.location.search);
var codigoProcesso = params.get("codigoProcesso"); 
var url = "../obras/dados/obraMetricas.php?codigoProcesso=" + codigoProcesso;

var resultados = [];
var dados = [];

// Fetch JSON data from the PHP script
fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error (document.getElementById("lstMetricasProgress").innerHTML = response.statusText);    
        }
        return response.json();
    })
    .then(fetchedData => {
        // Append the fetched data to the existing array
        resultados = resultados.concat(fetchedData);

        var metricaProgress = document.getElementById("lstMetricasProgress");

        resultados.forEach((resultado) => {
        
            dados.push(resultado["mt_designacao"]);
            metricaProgress.innerHTML += dados;
        });

        //console.log("Resultados: ", dados);

    })
    .catch(error => {
        document.getElementById("lstMetricasProgress").innerHTML = error;
        //console.error("Error fetching the data:", error);
    });

