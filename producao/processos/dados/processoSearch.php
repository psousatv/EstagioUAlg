<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = strval($_GET['nomeProcesso']);

$query = "SELECT proces_check, proces_padm, proces_nome 
          FROM processo
          WHERE proces_nome LIKE '%"  .$nomeProcesso. "%'";


$stmt = $myConn->query($query);
$fetch = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array();

foreach($fetch as $row) {
  $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);

//$stmt->close();
