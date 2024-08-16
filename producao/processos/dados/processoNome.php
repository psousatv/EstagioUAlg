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
  <div class="btn btn-primary col-md-8 d-grid small text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>
  <div class="btn btn-warning col-md-2 d-grid small text-center"><a href="processos.html">Nova Procura <i class="fa fa-search mr-1"></i></a></div>
';
};