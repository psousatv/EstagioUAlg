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
  <div class="btn btn-dark col-md-8 d-grid small text-white text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>
  <div class="btn btn-dark col-md-2"><a class="text-white" href="processos.html">Nova Procura <i class="fa fa-search mr-1"> </a></i></div>
';
};