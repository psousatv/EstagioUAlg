<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];

$query = "SELECT *
          FROM candidaturas_submetidas
          WHERE candsub_codigo LIKE '%".$nomeCandidatura."%'";


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = $stmt->rowCount();

//header('Content-Type: application/json');
//echo json_encode($data);

foreach($data as $row) {
    echo  '
        <div class="btn btn-primary col-md-8 d-grid small text-white text-left">            
            '.$row["candsub_codigo"].': '.$row["candsub_nome"].'
        </div>
        
        <div class="btn btn-warning" onclick="candidaturaSelected('.$row["candsub_codigo"].')"><i class="fa fa-solid fa-refresh"></i></div>  
        <div class="btn btn-primary"><a class="text-white" href="main.html"><i class="fa fa-solid fa-search"></i></a></div>
        <div class="btn btn-danger"><a class="text-white" href="../../index.html"><i class="fa fa-solid fa-house"></i></a></div>
    ';
    };