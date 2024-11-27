<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

$query = 'SELECT proces_check, proces_padm, proces_nome
          FROM processo
          WHERE proces_check ="'.$codigoProcesso.'"';


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row) {
echo  '
  <div class="btn btn-primary col-md-8 d-grid small text-white text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>
  <div class="btn btn-warning" onclick="redirectObras()"><i class="fa fa-solid fa-refresh"></i></div>  
  <div class="btn btn-primary"><a class="text-white" href="obrasSearch.html"><i class="fa fa-solid fa-search"></i></a></div>
  <div class="btn btn-danger"><a class="text-white" href="../../index.html"><i class="fa fa-solid fa-house"></i></a></div>
';
};
