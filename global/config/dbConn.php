<?php

//Variaveis conexão ao servidor
//$myHost = "localhost";
$myHost = "mdb1";
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

//PDO - Connection to Postgresql
//$pgConn = new PDO("pgsql:host=$myHost port=5432 dbname=$database user=$user password=$password");
//if($pgConn === false) {
//    echo "Ocorreu um erro com a conexão pdo";
//    exit();
//}

//PG_CONNECT - Connection to Postgresql
$pgConn = pg_connect("host=$myHost port=5432 dbname=$pgDatabase user=$user password=$password");
if(!$pgConn){
    die('Ocorreu um erro com a conexão pg_connect');
}
