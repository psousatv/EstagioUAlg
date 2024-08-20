<?php

//Variaveis conexão ao servidor
$myHost = "localhost";
//$myHost = "mdb1";
$user = "tv";
$password = "taviraverde";
//Bases de Dados
$myDatabase = "compras";
$pgDatabase = "cadastro";

//PDO - Connection to MySQL
$myConn = new PDO("mysql:host=$myHost;dbname=$myDatabase", $user, $password);

if($myConn === false) {
    echo "Ocorreu um erro com a conexão";
    exit();
}