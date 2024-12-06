
//var params = new URLSearchParams(window.location.search);
//var codigoProcesso = params.get("codigoProcesso"); 
var url = "dados/main.php";

var resultados = [];
var vistoriasNoAno = [];


//Funcção
fetchData();

// Fetch JSON data from the PHP script
function fetchData(){
fetch(url)
.then(response => {
    if(!response.ok){
        throw new Error (document.getElementById('vistorias').innerHTML = response.statusText);    
    }
    return response.json();
})
.then(data => {
    resultados.push(...data);

    //for(var i = 0; i < resultados.length; i++){
    //    vistoriasNoAno.push(resultados[i].data);
    //};

    resultados.forEach((resultado) =>{
        data = new Date(resultado["data"]);
        

        if(data.getFullYear() == 2024){
            vistoriasNoAno.push(resultado["data"]);
        }
    });

    document.getElementById('vistorias').innerHTML = vistoriasNoAno;


    //console.log("vistoriasNoAno: ",resultados);

})
    .catch(error => {
        document.getElementById('vistorias').innerHTML = error;
    });
};
