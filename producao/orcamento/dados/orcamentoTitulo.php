<?php
//session_start();
include "../../../global/config/dbConn.php";

$orcamentoItem = $_GET['orcamentoItem'];

$query = "SELECT *
          FROM rubricas
          WHERE rub_cod = '".$orcamentoItem."'";


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = $stmt->rowCount();

//header('Content-Type: application/json');
//echo json_encode($data);

foreach($data as $row) {
    echo  '
        <div class="btn btn-primary col-md-8 d-grid small text-white text-left">
            '.$row["rub_cod"].': '.$row["rub_tipo"].' - '.$row["rub_rubrica"].'- '.$row["rub_item"].'
        </div>
        <div class="btn btn-warning" onclick="orcamentoTitulo('.$row["rub_cod"].')"><i class="fa fa-solid fa-refresh"></i></div>  
        <div class="btn btn-primary"><a class="text-white" href="orcamentoDashboard.html"><i class="fa fa-solid fa-search"></i></a></div>
        
    ';
};