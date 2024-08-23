<?php
//session_start();
include "../../../global/config/dbConn.php";

$faseProcessos = $_GET['faseProcessos'];

$query = 'SELECT proces_check, proces_padm, proces_cod, proces_sub, proces_nome, proces_estado_data, descr_fase_processo
          FROM processo
          INNER JOIN descritivos d ON descr_cod = proces_estado
          WHERE descr_fase_processo ="'.$faseProcessos.'"
          ORDER BY proces_cod, proces_estado_data';


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row) {
echo  '
  <div class="small text-left">'.$row["descr_fase_processo"].'_'.$row["proces_padm"].'_'.$row["proces_cod"].'_'.$row["proces_sub"].'</div>
';
};